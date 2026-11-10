<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Order $order;

    #[ORM\ManyToOne(targetEntity: ProductVariant::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?ProductVariant $variant;

    #[ORM\Column]
    private int $quantity;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $priceAtTime;

    #[ORM\Column(length: 200)]
    private string $productName;

    #[ORM\Column(length: 500)]
    private string $productImage = '';

    public function __construct(Order $order, ?ProductVariant $variant, int $quantity, string $priceAtTime, string $productName, string $productImage = '')
    {
        $this->order = $order;
        $this->variant = $variant;
        $this->quantity = $quantity;
        $this->priceAtTime = $priceAtTime;
        $this->productName = $productName;
        $this->productImage = $productImage;
        $order->addItem($this);
    }

    public function getId(): ?int { return $this->id; }
    public function getVariant(): ?ProductVariant { return $this->variant; }
    public function getQuantity(): int { return $this->quantity; }
    public function getPriceAtTime(): string { return $this->priceAtTime; }
    public function getProductName(): string { return $this->productName; }
    public function getProductImage(): string { return $this->productImage; }
    public function getTotalPrice(): string { return number_format((float) $this->priceAtTime * $this->quantity, 2, '.', ''); }
}
