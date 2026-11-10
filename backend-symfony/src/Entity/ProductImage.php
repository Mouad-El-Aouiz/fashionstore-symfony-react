<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class ProductImage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Product::class, inversedBy: 'images')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Product $product;

    #[ORM\Column(length: 500)]
    private string $image;

    #[ORM\Column]
    private bool $isPrimary = false;

    #[ORM\Column(length: 200)]
    private string $altText = '';

    public function __construct(Product $product, string $image, bool $isPrimary = false, string $altText = '')
    {
        $this->product = $product;
        $this->image = $image;
        $this->isPrimary = $isPrimary;
        $this->altText = $altText;
    }

    public function getId(): ?int { return $this->id; }
    public function getImage(): string { return $this->image; }
    public function isPrimary(): bool { return $this->isPrimary; }
    public function getAltText(): string { return $this->altText; }
}
