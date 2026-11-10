<?php

namespace App\Controller;

use App\Entity\EmailConfirmationToken;
use App\Entity\Product;
use App\Entity\RefreshToken;
use App\Entity\User;
use App\Entity\UserProfile;
use App\Entity\Wishlist;
use App\Service\ImageUrl;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class AuthController
{
    private const ACCESS_TOKEN_TTL = 900;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly MailerInterface $mailer,
        private readonly Security $security,
        #[Autowire('%env(FRONTEND_URL)%')]
        private readonly string $frontendUrl,
    ) {}

    #[Route('/api/auth/csrf/', methods: ['GET'])]
    public function csrf(Request $request): JsonResponse
    {
        $token = bin2hex(random_bytes(32));
        $response = new JsonResponse(['csrfToken' => $token]);
        $response->headers->setCookie(new Cookie(
            'CSRF_TOKEN',
            $token,
            0,
            '/api',
            null,
            $request->isSecure(),
            true,
            false,
            $this->cookieSameSite($request),
        ));

        return $response;
    }

    #[Route('/api/auth/register/', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = $request->getPayload()->all();
        $username = trim((string) ($data['username'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');
        $passwordConfirmation = (string) ($data['password2'] ?? '');

        if ($username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            return new JsonResponse(['error' => 'Nom d’utilisateur, adresse e-mail ou mot de passe invalide. Le mot de passe doit contenir au moins 8 caractères.'], 400);
        }
        if (!hash_equals($password, $passwordConfirmation)) {
            return new JsonResponse(['password' => 'Les mots de passe ne correspondent pas.'], 400);
        }
        $repository = $this->entityManager->getRepository(User::class);
        if ($repository->findOneBy(['username' => $username]) || $repository->findOneBy(['email' => $email])) {
            return new JsonResponse(['error' => 'Ce nom d’utilisateur ou cette adresse e-mail est déjà utilisé.'], 400);
        }

        $user = (new User($username, $email))
            ->setFirstName((string) ($data['first_name'] ?? ''))
            ->setLastName((string) ($data['last_name'] ?? ''));
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $confirmation = new EmailConfirmationToken(
            self::uuid(),
            $user,
            new \DateTimeImmutable('+24 hours'),
        );

        $this->entityManager->persist($user);
        $this->entityManager->persist(new UserProfile($user));
        $this->entityManager->persist($confirmation);
        $this->entityManager->flush();

        $confirmationUrl = rtrim($this->frontendUrl, '/').'/confirm-email/'.$confirmation->getToken().'/';
        $this->mailer->send((new Email())
            ->from($_ENV['DEFAULT_FROM_EMAIL'] ?? 'no-reply@fashionstore.local')
            ->to($user->getEmail())
            ->subject('Confirmez votre inscription - FashionStore')
            ->text(sprintf("Bonjour %s,\n\nConfirmez votre adresse e-mail : %s\n\nCe lien expire dans 24 heures.", $user->getUsername(), $confirmationUrl))
            ->html(sprintf('<p>Bonjour %s,</p><p><a href="%s">Activer mon compte</a></p><p>Ce lien expire dans 24 heures.</p>', htmlspecialchars($user->getUsername(), ENT_QUOTES), htmlspecialchars($confirmationUrl, ENT_QUOTES))));

        return new JsonResponse(['id' => $user->getId(), 'username' => $user->getUsername(), 'email' => $user->getEmail()], 201);
    }

    #[Route('/api/auth/login/', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = $request->getPayload()->all();
        $identifier = trim((string) ($data['username'] ?? ''));
        $repository = $this->entityManager->getRepository(User::class);
        $user = $repository->findOneBy(['username' => $identifier])
            ?? $repository->findOneBy(['email' => strtolower($identifier)]);
        if (!$user || !$user->isActive() || !$this->passwordHasher->isPasswordValid($user, (string) ($data['password'] ?? ''))) {
            return new JsonResponse(['detail' => 'Identifiants invalides ou compte non activé.'], 401);
        }

        return $this->issueTokenPair($user, $request);
    }

    #[Route('/api/auth/refresh/', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $token = (string) $request->cookies->get('REFRESH_TOKEN', '');
        $refreshToken = $token === '' ? null : $this->entityManager->find(RefreshToken::class, $token);
        if (!$refreshToken || $refreshToken->getExpiresAt() <= new \DateTimeImmutable()) {
            if ($refreshToken) {
                $this->entityManager->remove($refreshToken);
                $this->entityManager->flush();
            }

            $response = new JsonResponse(['detail' => 'Jeton de renouvellement invalide ou expiré.'], 401);
            $this->clearAuthCookies($response, $request);

            return $response;
        }

        $user = $refreshToken->getUser();
        $this->entityManager->remove($refreshToken);
        $this->entityManager->flush();

        return $this->issueTokenPair($user, $request);
    }

    #[Route('/api/auth/logout/', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $token = (string) $request->cookies->get('REFRESH_TOKEN', '');
        $refreshToken = $token === '' ? null : $this->entityManager->find(RefreshToken::class, $token);
        if ($refreshToken) {
            $this->entityManager->remove($refreshToken);
            $this->entityManager->flush();
        }

        $response = new JsonResponse(['message' => 'Déconnexion réussie.']);
        $this->clearAuthCookies($response, $request);

        return $response;
    }

    #[Route('/api/auth/confirm-email/{token}/', methods: ['GET'])]
    public function confirmEmail(string $token): JsonResponse
    {
        $confirmation = $this->entityManager->find(EmailConfirmationToken::class, $token);
        if (!$confirmation || $confirmation->getExpiresAt() <= new \DateTimeImmutable()) {
            return new JsonResponse(['error' => 'Lien de confirmation invalide ou expiré.'], 400);
        }
        $user = $confirmation->getUser();
        $user->setIsActive(true)->setEmailVerified(true);
        $this->entityManager->remove($confirmation);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.']);
    }

    #[Route('/api/auth/profile/', methods: ['GET', 'PUT', 'PATCH'])]
    public function profile(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);
        if (!$user) {
            return new JsonResponse(['detail' => 'Authentification requise.'], 401);
        }
        $profile = $this->entityManager->getRepository(UserProfile::class)->findOneBy(['user' => $user]);
        if (!$profile) {
            $profile = new UserProfile($user);
            $this->entityManager->persist($profile);
        }

        if ($request->isMethod('PUT') || $request->isMethod('PATCH')) {
            $data = $request->getPayload()->all();
            foreach (['phone', 'address', 'city', 'postal_code', 'country', 'avatar'] as $field) {
                if (!array_key_exists($field, $data)) {
                    continue;
                }
                $value = (string) $data[$field];
                match ($field) {
                    'phone' => $profile->setPhone($value),
                    'address' => $profile->setAddress($value),
                    'city' => $profile->setCity($value),
                    'postal_code' => $profile->setPostalCode($value),
                    'country' => $profile->setCountry($value),
                    'avatar' => $profile->setAvatar($value),
                };
            }
            if (isset($data['first_name'])) {
                $user->setFirstName((string) $data['first_name']);
            }
            if (isset($data['last_name'])) {
                $user->setLastName((string) $data['last_name']);
            }
            $this->entityManager->flush();
        }

        return new JsonResponse($this->serializeProfile($profile));
    }

    #[Route('/api/auth/change-password/', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);
        if (!$user) {
            return new JsonResponse(['detail' => 'Authentification requise.'], 401);
        }
        $data = $request->getPayload()->all();
        $oldPassword = (string) ($data['old_password'] ?? '');
        $newPassword = (string) ($data['new_password'] ?? '');
        if (!$this->passwordHasher->isPasswordValid($user, $oldPassword)) {
            return new JsonResponse(['old_password' => 'Le mot de passe actuel est incorrect.'], 400);
        }
        if (strlen($newPassword) < 8 || $newPassword !== (string) ($data['confirm_password'] ?? '')) {
            return new JsonResponse(['new_password' => 'Le nouveau mot de passe est invalide ou les confirmations ne correspondent pas.'], 400);
        }
        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Mot de passe modifié avec succès.']);
    }

    #[Route('/api/auth/wishlist/', methods: ['GET', 'POST'])]
    #[Route('/api/auth/wishlist/{productId}/', requirements: ['productId' => '\d+'], methods: ['DELETE'])]
    public function wishlist(Request $request, ?int $productId = null): JsonResponse
    {
        $user = $this->currentUser($request);
        if (!$user) {
            return new JsonResponse(['detail' => 'Authentification requise.'], 401);
        }
        if ($request->isMethod('GET')) {
            $entries = $this->entityManager->getRepository(Wishlist::class)->findBy(['user' => $user], ['createdAt' => 'DESC']);

            return new JsonResponse(array_map(fn (Wishlist $entry) => $this->serializeWishlist($entry), $entries));
        }
        $data = $request->getPayload()->all();
        $id = $productId ?? (int) ($data['product_id'] ?? 0);
        if ($id < 1) {
            return new JsonResponse(['error' => 'product_id est requis.'], 400);
        }

        $product = $this->entityManager->getRepository(Product::class)->findOneBy(['id' => $id, 'isActive' => true]);
        if (!$product) {
            return new JsonResponse(['error' => 'Produit non trouvé.'], 404);
        }
        $entry = $this->entityManager->getRepository(Wishlist::class)->findOneBy(['user' => $user, 'product' => $product]);
        if ($request->isMethod('DELETE')) {
            if ($entry) {
                $this->entityManager->remove($entry);
                $this->entityManager->flush();
            }

            return new JsonResponse(['message' => 'Produit retiré des favoris.']);
        }
        if ($entry) {
            return new JsonResponse(['message' => 'Produit déjà dans les favoris.']);
        }
        $this->entityManager->persist(new Wishlist($user, $product));
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Produit ajouté aux favoris.', 'product_id' => $id], 201);
    }

    private function issueTokenPair(User $user, Request $request): JsonResponse
    {
        $refresh = new RefreshToken(bin2hex(random_bytes(32)), $user, new \DateTimeImmutable('+7 days'));
        $this->entityManager->persist($refresh);
        $this->entityManager->flush();

        $response = new JsonResponse(['message' => 'Connexion réussie.']);
        $response->headers->setCookie(new Cookie(
            'ACCESS_TOKEN',
            $this->jwtManager->create($user),
            time() + self::ACCESS_TOKEN_TTL,
            '/api',
            null,
            $request->isSecure(),
            true,
            false,
            $this->cookieSameSite($request),
        ));
        $response->headers->setCookie(new Cookie(
            'REFRESH_TOKEN',
            $refresh->getToken(),
            $refresh->getExpiresAt(),
            '/api/auth',
            null,
            $request->isSecure(),
            true,
            false,
            $this->cookieSameSite($request),
        ));
        $response->headers->setCookie(new Cookie(
            'SESSION_HINT',
            '1',
            $refresh->getExpiresAt(),
            '/',
            null,
            $request->isSecure(),
            false,
            false,
            $this->cookieSameSite($request),
        ));

        return $response;
    }

    private function clearAuthCookies(JsonResponse $response, Request $request): void
    {
        foreach ([
            ['ACCESS_TOKEN', '/api', true],
            ['REFRESH_TOKEN', '/api/auth', true],
            ['SESSION_HINT', '/', false],
        ] as [$name, $path, $httpOnly]) {
            $response->headers->setCookie(new Cookie(
                $name,
                '',
                1,
                $path,
                null,
                $request->isSecure(),
                $httpOnly,
                false,
                $this->cookieSameSite($request),
            ));
        }
    }

    private function cookieSameSite(Request $request): string
    {
        return $request->isSecure() ? Cookie::SAMESITE_NONE : Cookie::SAMESITE_LAX;
    }

    private function currentUser(Request $request): ?User
    {
        $user = $this->security->getUser();
        if ($user instanceof User) {
            return $user;
        }

        return null;
    }

    private function serializeProfile(UserProfile $profile): array
    {
        $user = $profile->getUser();

        return [
            'id' => $profile->getId(),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'first_name' => $user->getFirstName(),
                'last_name' => $user->getLastName(),
            ],
            'phone' => $profile->getPhone(),
            'address' => $profile->getAddress(),
            'city' => $profile->getCity(),
            'postal_code' => $profile->getPostalCode(),
            'country' => $profile->getCountry(),
            'avatar' => ImageUrl::resolve($profile->getAvatar()),
        ];
    }

    private function serializeWishlist(Wishlist $entry): array
    {
        $product = $entry->getProduct();
        $image = null;
        foreach ($product->getImages() as $productImage) {
            if ($productImage->isPrimary()) {
                $image = ImageUrl::resolve($productImage->getImage());
                break;
            }
        }
        $image ??= ImageUrl::resolve($product->getImages()->first()?->getImage());

        return [
            'id' => $entry->getId(),
            'product' => $product->getId(),
            'product_name' => $product->getName(),
            'product_slug' => $product->getSlug(),
            'product_price' => $product->getPrice(),
            'product_stock' => $product->getStock(),
            'product_image' => $image,
            'created_at' => $entry->getCreatedAt()->format(DATE_ATOM),
        ];
    }

    private static function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);

        return substr($hex, 0, 8).'-'.substr($hex, 8, 4).'-'.substr($hex, 12, 4).'-'.substr($hex, 16, 4).'-'.substr($hex, 20);
    }
}
