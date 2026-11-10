<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Index(name: 'idx_product_active_featured', columns: ['is_active', 'is_featured'])]
#[ORM\Index(name: 'idx_product_gender_created', columns: ['gender', 'created_at'])]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    private string $name;

    #[ORM\Column(length: 220, unique: true)]
    private string $slug;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Category $category;

    #[ORM\Column(length: 1)]
    private string $gender;

    #[ORM\Column(type: 'text')]
    private string $description;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $price;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    private ?string $discountPrice = null;

    #[ORM\Column(options: ['default' => 0])]
    private int $stock = 0;

    #[ORM\Column]
    private bool $isActive = true;

    #[ORM\Column]
    private bool $isFeatured = false;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, ProductImage> */
    #[ORM\OneToMany(mappedBy: 'product', targetEntity: ProductImage::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $images;

    /** @var Collection<int, ProductVariant> */
    #[ORM\OneToMany(mappedBy: 'product', targetEntity: ProductVariant::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $variants;

    public function __construct(string $name, string $slug, Category $category, string $gender, string $description, string $price)
    {
        $this->name = $name;
        $this->slug = $slug;
        $this->category = $category;
        $this->gender = $gender;
        $this->description = $description;
        $this->price = $price;
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = $this->createdAt;
        $this->images = new ArrayCollection();
        $this->variants = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getSlug(): string { return $this->slug; }
    public function getCategory(): Category { return $this->category; }
    public function getGender(): string { return $this->gender; }
    public function getDescription(): string { return $this->description; }
    public function getPrice(): string { return $this->price; }
    public function getDiscountPrice(): ?string { return $this->discountPrice; }
    public function setDiscountPrice(?string $discountPrice): self { $this->discountPrice = $discountPrice; return $this; }
    public function getFinalPrice(): string { return $this->discountPrice ?? $this->price; }
    public function getStock(): int { return $this->stock; }
    public function setStock(int $stock): self { $this->stock = $stock; return $this; }
    public function isActive(): bool { return $this->isActive; }
    public function isFeatured(): bool { return $this->isFeatured; }
    public function setIsFeatured(bool $isFeatured): self { $this->isFeatured = $isFeatured; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getImages(): Collection { return $this->images; }
    public function getVariants(): Collection { return $this->variants; }
    public function addImage(ProductImage $image): self { $this->images->add($image); return $this; }
    public function addVariant(ProductVariant $variant): self { $this->variants->add($variant); return $this; }
}
