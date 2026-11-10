<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\UniqueConstraint(name: 'uniq_cart_item_cart_variant', columns: ['cart_id', 'variant_id'])]
class CartItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Cart::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Cart $cart;

    #[ORM\ManyToOne(targetEntity: ProductVariant::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ProductVariant $variant;

    #[ORM\Column]
    private int $quantity;

    public function __construct(Cart $cart, ProductVariant $variant, int $quantity)
    {
        $this->cart = $cart;
        $this->variant = $variant;
        $this->quantity = $quantity;
        $cart->addItem($this);
    }

    public function getId(): ?int { return $this->id; }
    public function getCart(): Cart { return $this->cart; }
    public function getVariant(): ProductVariant { return $this->variant; }
    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $quantity): self { $this->quantity = $quantity; return $this; }
    public function getTotalPrice(): string { return number_format((float) $this->variant->getFinalPrice() * $this->quantity, 2, '.', ''); }
}
