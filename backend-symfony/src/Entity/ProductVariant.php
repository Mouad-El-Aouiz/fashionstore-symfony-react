<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\UniqueConstraint(name: 'uniq_variant_product_size_color', columns: ['product_id', 'size', 'color'])]
class ProductVariant
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Product::class, inversedBy: 'variants')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Product $product;

    #[ORM\Column(length: 5)]
    private string $size;

    #[ORM\Column(length: 20)]
    private string $color;

    #[ORM\Column(length: 50, unique: true)]
    private string $sku;

    #[ORM\Column(options: ['default' => 0])]
    private int $stock = 0;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $priceAdjustment = '0.00';

    public function __construct(Product $product, string $size, string $color, string $sku, int $stock = 0, string $priceAdjustment = '0.00')
    {
        $this->product = $product;
        $this->size = $size;
        $this->color = $color;
        $this->sku = $sku;
        $this->stock = $stock;
        $this->priceAdjustment = $priceAdjustment;
    }

    public function getId(): ?int { return $this->id; }
    public function getProduct(): Product { return $this->product; }
    public function getSize(): string { return $this->size; }
    public function getColor(): string { return $this->color; }
    public function getSku(): string { return $this->sku; }
    public function getStock(): int { return $this->stock; }
    public function setStock(int $stock): self { $this->stock = $stock; return $this; }
    public function getPriceAdjustment(): string { return $this->priceAdjustment; }
    public function getFinalPrice(): string { return number_format((float) $this->product->getFinalPrice() + (float) $this->priceAdjustment, 2, '.', ''); }
}
