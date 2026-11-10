<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'orders')]
#[ORM\Index(name: 'idx_order_user_created', columns: ['user_id', 'created_at'])]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 50, unique: true)]
    private string $orderNumber;

    #[ORM\Column(length: 20)]
    private string $status = 'PENDING';

    #[ORM\Column(length: 20)]
    private string $paymentStatus = 'PENDING';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $totalAmount;

    #[ORM\Column(type: 'text')]
    private string $shippingAddress;

    #[ORM\Column(length: 100)]
    private string $shippingCity;

    #[ORM\Column(length: 20)]
    private string $shippingPostalCode;

    #[ORM\Column(length: 100)]
    private string $shippingCountry;

    #[ORM\Column(length: 20)]
    private string $phone;

    #[ORM\Column(length: 180)]
    private string $email;

    #[ORM\Column(type: 'text')]
    private string $notes = '';

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, OrderItem> */
    #[ORM\OneToMany(mappedBy: 'order', targetEntity: OrderItem::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $items;

    public function __construct(User $user, string $totalAmount, array $shipping)
    {
        $this->user = $user;
        $this->totalAmount = $totalAmount;
        $this->shippingAddress = $shipping['shipping_address'];
        $this->shippingCity = $shipping['shipping_city'];
        $this->shippingPostalCode = $shipping['shipping_postal_code'];
        $this->shippingCountry = $shipping['shipping_country'] ?? 'Maroc';
        $this->phone = $shipping['phone'];
        $this->email = $shipping['email'];
        $this->notes = $shipping['notes'] ?? '';
        $this->createdAt = $this->updatedAt = new \DateTimeImmutable();
        $this->orderNumber = 'ORD-'.strtoupper(bin2hex(random_bytes(4)));
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getOrderNumber(): string { return $this->orderNumber; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getPaymentStatus(): string { return $this->paymentStatus; }
    public function setPaymentStatus(string $status): self { $this->paymentStatus = $status; return $this; }
    public function getTotalAmount(): string { return $this->totalAmount; }
    public function getShippingAddress(): string { return $this->shippingAddress; }
    public function getShippingCity(): string { return $this->shippingCity; }
    public function getShippingPostalCode(): string { return $this->shippingPostalCode; }
    public function getShippingCountry(): string { return $this->shippingCountry; }
    public function getPhone(): string { return $this->phone; }
    public function getEmail(): string { return $this->email; }
    public function getNotes(): string { return $this->notes; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getItems(): Collection { return $this->items; }
    public function addItem(OrderItem $item): void
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
        }
    }
}
