<?php

namespace App\Command;

use App\Entity\Category;
use App\Entity\Product;
use App\Entity\ProductImage;
use App\Entity\ProductVariant;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:demo:seed',
    description: 'Load fictional categories and products into an empty catalogue.',
)]
final class SeedDemoCatalogCommand extends Command
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $productRepository = $this->entityManager->getRepository(Product::class);
        if ($productRepository->count([]) > 0) {
            $io->error('The catalogue is not empty. Demo data was not added.');

            return Command::FAILURE;
        }

        $categoryData = [
            'homme' => ['name' => 'Homme', 'gender' => 'M', 'image' => 'photo-1550995694-3f5f4a7e1bd2'],
            'femme' => ['name' => 'Femme', 'gender' => 'F', 'image' => 'photo-1483985988355-763728e1935b'],
            'accessoires' => ['name' => 'Accessoires', 'gender' => 'U', 'image' => 'photo-1445205170230-053b83016050'],
            'sport' => ['name' => 'Sport', 'gender' => 'U', 'image' => 'photo-1517836357463-d25dfeac3438'],
        ];
        $categories = [];

        foreach ($categoryData as $slug => $data) {
            $category = new Category($data['name'], $slug, $data['gender']);
            $category->setImage(self::unsplash($data['image']));
            $category->setDescription(sprintf('Découvrez notre sélection %s.', mb_strtolower($data['name'])));
            $this->entityManager->persist($category);
            $categories[$slug] = $category;
        }

        $products = [
            ['name' => 'T-shirt essentiel', 'slug' => 'demo-t-shirt-essentiel', 'category' => 'homme', 'gender' => 'M', 'description' => 'Un t-shirt doux et polyvalent pour tous les jours.', 'price' => '249.00', 'discount' => null, 'featured' => true, 'image' => 'photo-1521572163474-6864f9cf17ab'],
            ['name' => 'Veste urbaine', 'slug' => 'demo-veste-urbaine', 'category' => 'homme', 'gender' => 'M', 'description' => 'Une veste légère aux lignes modernes.', 'price' => '799.00', 'discount' => '699.00', 'featured' => true, 'image' => 'photo-1591047139829-d91aecb6caea'],
            ['name' => 'Jean classique', 'slug' => 'demo-jean-classique', 'category' => 'homme', 'gender' => 'M', 'description' => 'Un jean confortable à porter en toute occasion.', 'price' => '599.00', 'discount' => null, 'featured' => false, 'image' => 'photo-1542272604-787c3835535d'],
            ['name' => 'Robe élégante', 'slug' => 'demo-robe-elegante', 'category' => 'femme', 'gender' => 'F', 'description' => 'Une silhouette élégante et facile à porter.', 'price' => '749.00', 'discount' => null, 'featured' => true, 'image' => 'photo-1539008835657-9e8e9680c956'],
            ['name' => 'Pull doux', 'slug' => 'demo-pull-doux', 'category' => 'femme', 'gender' => 'F', 'description' => 'Un pull doux pour composer une tenue confortable.', 'price' => '549.00', 'discount' => '479.00', 'featured' => false, 'image' => 'photo-1576566588028-4147f3842f27'],
            ['name' => 'Chemise fluide', 'slug' => 'demo-chemise-fluide', 'category' => 'femme', 'gender' => 'F', 'description' => 'Une chemise fluide aux détails soignés.', 'price' => '449.00', 'discount' => null, 'featured' => false, 'image' => 'photo-1598554747436-c9293d6a588f'],
            ['name' => 'Sac de ville', 'slug' => 'demo-sac-de-ville', 'category' => 'accessoires', 'gender' => 'U', 'description' => 'Un sac pratique au design intemporel.', 'price' => '649.00', 'discount' => null, 'featured' => true, 'image' => 'photo-1548036328-c9fa89d128fa'],
            ['name' => 'Sweat performance', 'slug' => 'demo-sweat-performance', 'category' => 'sport', 'gender' => 'U', 'description' => 'Un sweat confortable pour les journées actives.', 'price' => '499.00', 'discount' => null, 'featured' => false, 'image' => 'photo-1556821840-3a63f95609a7'],
        ];

        foreach ($products as $data) {
            $product = (new Product(
                $data['name'],
                $data['slug'],
                $categories[$data['category']],
                $data['gender'],
                $data['description'],
                $data['price'],
            ))
                ->setDiscountPrice($data['discount'])
                ->setStock(30)
                ->setIsFeatured($data['featured']);

            $product->addImage(new ProductImage($product, self::unsplash($data['image']), true, $data['name']));
            foreach (['S', 'M', 'L', 'XL'] as $size) {
                $product->addVariant(new ProductVariant(
                    $product,
                    $size,
                    'BLACK',
                    strtoupper(str_replace('-', '', $data['slug'])).'-'.$size,
                    7,
                ));
            }
            $this->entityManager->persist($product);
        }

        $this->entityManager->flush();
        $io->success(sprintf('Loaded %d fictional categories and %d demo products.', count($categories), count($products)));

        return Command::SUCCESS;
    }

    private static function unsplash(string $photoId): string
    {
        return sprintf('https://images.unsplash.com/%s?auto=format&fit=crop&w=900&q=80', $photoId);
    }
}
