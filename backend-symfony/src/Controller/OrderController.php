<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class OrderController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {}

    #[Route('/api/orders/', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->currentUser();
        if (!$user) {
            return new JsonResponse(['detail' => 'Authentification requise.'], 401);
        }
        $pageSize = min(100, max(1, (int) $request->query->get('page_size', 12)));
        $page = max(1, (int) $request->query->get('page', 1));
        $repository = $this->entityManager->getRepository(Order::class);
        $total = $repository->count(['user' => $user]);
        $orders = $repository->findBy(['user' => $user], ['createdAt' => 'DESC'], $pageSize, ($page - 1) * $pageSize);

        $query = $request->query->all();
        $urlForPage = static function (int $number) use ($query, $request): string {
            $query['page'] = $number;
            return $request->getPathInfo().'?'.http_build_query($query);
        };

        return new JsonResponse([
            'count' => $total,
            'next' => $page * $pageSize < $total ? $urlForPage($page + 1) : null,
            'previous' => $page > 1 ? $urlForPage($page - 1) : null,
            'results' => array_map(fn (Order $order) => $this->serializeOrder($order), $orders),
        ]);
    }

    #[Route('/api/orders/{id}/', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        $order = $this->ownedOrder($id);

        return $order ? new JsonResponse($this->serializeOrder($order)) : new JsonResponse(['detail' => 'Commande non trouvée.'], 404);
    }

    #[Route('/api/orders/{id}/cancel/', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function cancel(int $id): JsonResponse
    {
        $order = $this->ownedOrder($id);
        if (!$order) {
            return new JsonResponse(['error' => 'Commande non trouvée.'], 404);
        }
        if (!in_array($order->getStatus(), ['PENDING', 'PROCESSING'], true)) {
            return new JsonResponse(['error' => 'Cette commande ne peut pas être annulée.'], 400);
        }
        foreach ($order->getItems() as $item) {
            $variant = $item->getVariant();
            if ($variant) {
                $variant->setStock($variant->getStock() + $item->getQuantity());
            }
        }
        $order->setStatus('CANCELLED');
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Commande annulée avec succès.']);
    }

    #[Route('/api/orders/track/{orderNumber}/', methods: ['GET'])]
    public function track(string $orderNumber): JsonResponse
    {
        $user = $this->currentUser();
        $order = $user ? $this->entityManager->getRepository(Order::class)->findOneBy(['user' => $user, 'orderNumber' => $orderNumber]) : null;
        if (!$order) {
            return new JsonResponse(['error' => 'Commande non trouvée.'], 404);
        }
        $created = $order->getCreatedAt();

        return new JsonResponse([
            'order_number' => $order->getOrderNumber(),
            'status' => self::statusLabel($order->getStatus()),
            'payment_status' => self::paymentStatusLabel($order->getPaymentStatus()),
            'created_at' => $created->format(DATE_ATOM),
            'estimated_delivery' => $created->modify('+5 days')->format(DATE_ATOM),
            'timeline' => [
                ['status' => 'COMMANDÉE', 'date' => $created->format(DATE_ATOM), 'completed' => true],
                ['status' => 'CONFIRMÉE', 'date' => null, 'completed' => $order->getStatus() !== 'PENDING'],
                ['status' => 'EXPÉDIÉE', 'date' => null, 'completed' => in_array($order->getStatus(), ['SHIPPED', 'DELIVERED'], true)],
                ['status' => 'LIVRÉE', 'date' => null, 'completed' => $order->getStatus() === 'DELIVERED'],
            ],
        ]);
    }

    private function currentUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }

    private function ownedOrder(int $id): ?Order
    {
        $user = $this->currentUser();

        return $user ? $this->entityManager->getRepository(Order::class)->findOneBy(['id' => $id, 'user' => $user]) : null;
    }

    private function serializeOrder(Order $order): array
    {
        $items = array_map(static fn (OrderItem $item) => [
            'id' => $item->getId(),
            'product_name' => $item->getProductName(),
            'quantity' => $item->getQuantity(),
            'price_at_time' => $item->getPriceAtTime(),
            'total_price' => $item->getTotalPrice(),
            'product_image' => $item->getProductImage(),
        ], $order->getItems()->toArray());

        return [
            'id' => $order->getId(),
            'order_number' => $order->getOrderNumber(),
            'status' => $order->getStatus(),
            'status_display' => self::statusLabel($order->getStatus()),
            'payment_status' => $order->getPaymentStatus(),
            'payment_status_display' => self::paymentStatusLabel($order->getPaymentStatus()),
            'total_amount' => $order->getTotalAmount(),
            'shipping_address' => $order->getShippingAddress(),
            'shipping_city' => $order->getShippingCity(),
            'shipping_postal_code' => $order->getShippingPostalCode(),
            'shipping_country' => $order->getShippingCountry(),
            'phone' => $order->getPhone(),
            'email' => $order->getEmail(),
            'notes' => $order->getNotes(),
            'items' => $items,
            'created_at' => $order->getCreatedAt()->format(DATE_ATOM),
            'created_at_formatted' => $order->getCreatedAt()->format('d/m/Y à H:i'),
        ];
    }

    private static function statusLabel(string $status): string
    {
        return [
            'PENDING' => 'En attente',
            'PROCESSING' => 'En traitement',
            'CONFIRMED' => 'Confirmée',
            'SHIPPED' => 'Expédiée',
            'DELIVERED' => 'Livrée',
            'CANCELLED' => 'Annulée',
        ][$status] ?? $status;
    }

    private static function paymentStatusLabel(string $status): string
    {
        return ['PENDING' => 'En attente', 'PAID' => 'Payée', 'FAILED' => 'Échouée', 'REFUNDED' => 'Remboursée'][$status] ?? $status;
    }
}
