<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\ProductImage;
use App\Entity\ProductVariant;
use App\Entity\User;
use App\Service\ImageUrl;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class CartController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {}

    #[Route('/api/cart/', methods: ['GET'])]
    #[Route('/api/cart/add/', methods: ['POST'])]
    #[Route('/api/cart/update/{itemId}/', requirements: ['itemId' => '\d+'], methods: ['PUT'])]
    #[Route('/api/cart/remove/{itemId}/', requirements: ['itemId' => '\d+'], methods: ['DELETE'])]
    #[Route('/api/cart/clear/', methods: ['DELETE'])]
    public function cart(Request $request, ?int $itemId = null): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['detail' => 'Authentification requise.'], 401);
        }

        $cart = $this->entityManager->getRepository(Cart::class)->findOneBy(['user' => $user]);
        if (!$cart) {
            $cart = new Cart($user);
            $this->entityManager->persist($cart);
            $this->entityManager->flush();
        }

        if ($request->isMethod('GET')) {
            return new JsonResponse($this->serializeCart($cart));
        }

        if ($request->getPathInfo() === '/api/cart/clear/') {
            foreach ($cart->getItems() as $item) {
                $cart->removeItem($item);
                $this->entityManager->remove($item);
            }
            $this->entityManager->flush();

            return new JsonResponse($this->serializeCart($cart));
        }

        if ($request->getPathInfo() === '/api/cart/add/') {
            $data = $request->getPayload()->all();
            $variantId = filter_var($data['variant_id'] ?? null, FILTER_VALIDATE_INT);
            $quantity = filter_var($data['quantity'] ?? 1, FILTER_VALIDATE_INT);
            if (!$variantId || !$quantity || $quantity < 1) {
                return new JsonResponse(['error' => 'variant_id et une quantité positive sont requis.'], 400);
            }
            $variant = $this->entityManager->getRepository(ProductVariant::class)->find($variantId);
            if (!$variant) {
                return new JsonResponse(['error' => 'Variante non trouvée.'], 404);
            }
            $item = $this->entityManager->getRepository(CartItem::class)->findOneBy(['cart' => $cart, 'variant' => $variant]);
            $newQuantity = $quantity + ($item?->getQuantity() ?? 0);
            if ($newQuantity > $variant->getStock()) {
                return new JsonResponse(['error' => sprintf('Stock insuffisant. Maximum: %d', $variant->getStock())], 400);
            }
            if ($item) {
                $item->setQuantity($newQuantity);
            } else {
                $this->entityManager->persist(new CartItem($cart, $variant, $quantity));
            }
            $this->entityManager->flush();

            return new JsonResponse($this->serializeCart($cart));
        }

        $item = $itemId ? $this->entityManager->getRepository(CartItem::class)->findOneBy(['id' => $itemId, 'cart' => $cart]) : null;
        if (!$item) {
            return new JsonResponse(['detail' => 'Article du panier non trouvé.'], 404);
        }
        if ($request->isMethod('DELETE')) {
            $cart->removeItem($item);
            $this->entityManager->remove($item);
            $this->entityManager->flush();

            return new JsonResponse($this->serializeCart($cart));
        }

        $quantity = filter_var($request->getPayload()->all()['quantity'] ?? null, FILTER_VALIDATE_INT);
        if ($quantity === false || $quantity === null || $quantity < 0) {
            return new JsonResponse(['error' => 'La quantité ne peut pas être négative.'], 400);
        }
        if ($quantity > $item->getVariant()->getStock()) {
            return new JsonResponse(['error' => sprintf('Stock insuffisant. Maximum disponible: %d', $item->getVariant()->getStock())], 400);
        }
        if ($quantity === 0) {
            $cart->removeItem($item);
            $this->entityManager->remove($item);
        } else {
            $item->setQuantity($quantity);
        }
        $this->entityManager->flush();

        return new JsonResponse($this->serializeCart($cart));
    }

    private function serializeCart(Cart $cart): array
    {
        $items = array_map(static function (CartItem $item): array {
            $variant = $item->getVariant();
            $product = $variant->getProduct();
            $image = null;
            foreach ($product->getImages() as $productImage) {
                if ($productImage->isPrimary()) {
                    $image = ImageUrl::resolve($productImage->getImage());
                    break;
                }
            }
            $image ??= ImageUrl::resolve($product->getImages()->first()?->getImage());

            return [
                'id' => $item->getId(),
                'variant' => $variant->getId(),
                'variant_details' => [
                    'id' => $variant->getId(),
                    'size' => $variant->getSize(),
                    'color' => $variant->getColor(),
                    'sku' => $variant->getSku(),
                    'stock' => $variant->getStock(),
                    'price_adjustment' => $variant->getPriceAdjustment(),
                    'final_price' => $variant->getFinalPrice(),
                ],
                'quantity' => $item->getQuantity(),
                'total_price' => $item->getTotalPrice(),
                'unit_price' => $variant->getFinalPrice(),
                'product_name' => $product->getName(),
                'product_slug' => $product->getSlug(),
                'product_id' => $product->getId(),
                'product_image' => $image,
            ];
        }, $cart->getItems()->toArray());

        return [
            'id' => $cart->getId(),
            'items' => $items,
            'total_items' => $cart->getTotalItems(),
            'total_price' => $cart->getTotalPrice(),
        ];
    }
}
