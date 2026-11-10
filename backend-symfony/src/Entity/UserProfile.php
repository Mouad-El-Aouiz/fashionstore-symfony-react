<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class UserProfile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 20)]
    private string $phone = '';

    #[ORM\Column(type: 'text')]
    private string $address = '';

    #[ORM\Column(length: 100)]
    private string $city = '';

    #[ORM\Column(length: 20)]
    private string $postalCode = '';

    #[ORM\Column(length: 100)]
    private string $country = 'Maroc';

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $avatar = null;

    public function __construct(User $user) { $this->user = $user; }
    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getPhone(): string { return $this->phone; }
    public function setPhone(string $phone): self { $this->phone = $phone; return $this; }
    public function getAddress(): string { return $this->address; }
    public function setAddress(string $address): self { $this->address = $address; return $this; }
    public function getCity(): string { return $this->city; }
    public function setCity(string $city): self { $this->city = $city; return $this; }
    public function getPostalCode(): string { return $this->postalCode; }
    public function setPostalCode(string $postalCode): self { $this->postalCode = $postalCode; return $this; }
    public function getCountry(): string { return $this->country; }
    public function setCountry(string $country): self { $this->country = $country; return $this; }
    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): self { $this->avatar = $avatar; return $this; }
}
