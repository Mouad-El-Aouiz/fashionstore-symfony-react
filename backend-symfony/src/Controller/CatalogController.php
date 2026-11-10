<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\Product;
use App\Entity\ProductImage;
use App\Entity\ProductVariant;
use App\Service\ImageUrl;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class CatalogController
{
    public function __construct(private readonly EntityManagerInterface $entityManager) {}

    #[Route('/api/products/categories/', methods: ['GET'])]
    public function categories(Request $request): JsonResponse
    {
        $categories = $this->entityManager->getRepository(Category::class)->findBy(
            ['isActive' => true, 'parent' => null],
            ['name' => 'ASC'],
        );
        $items = array_map(fn (Category $category) => $this->serializeCategory($category), $categories);

        return $this->paginate($items, $request);
    }

    #[Route('/api/products/categories/{id}/', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function category(int $id): JsonResponse
    {
        $category = $this->entityManager->getRepository(Category::class)->findOneBy(['id' => $id, 'isActive' => true]);
        if (!$category) {
            return new JsonResponse(['detail' => 'Catégorie non trouvée.'], 404);
        }

        return new JsonResponse($this->serializeCategory($category));
    }

    #[Route('/api/products/categories/{id}/products/', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function categoryProducts(int $id, Request $request): JsonResponse
    {
        $category = $this->entityManager->getRepository(Category::class)->find($id);
        if (!$category || !$category->isActive()) {
            return new JsonResponse(['detail' => 'Catégorie non trouvée.'], 404);
        }

        $ids = $this->categoryTreeIds($category);
        $products = $this->entityManager->createQueryBuilder()
            ->select('p')
            ->from(Product::class, 'p')
            ->where('IDENTITY(p.category) IN (:categoryIds)')
            ->andWhere('p.isActive = true')
            ->setParameter('categoryIds', $ids)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        return $this->paginate(array_map(fn (Product $product) => $this->serializeProduct($product), $products), $request);
    }

    #[Route('/api/products/products/', methods: ['GET'])]
    public function products(Request $request): JsonResponse
    {
        $query = $this->entityManager->createQueryBuilder()
            ->select('DISTINCT p')
            ->from(Product::class, 'p')
            ->join('p.category', 'c')
            ->leftJoin('p.variants', 'v')
            ->where('p.isActive = true');

        $search = trim((string) $request->query->get('search', $request->query->get('q', '')));
        if ($search !== '') {
            $query->andWhere('LOWER(p.name) LIKE :search OR LOWER(p.description) LIKE :search OR LOWER(c.name) LIKE :search')
                ->setParameter('search', '%'.mb_strtolower($search).'%');
        }

        $gender = strtoupper((string) $request->query->get('gender', ''));
        if (in_array($gender, ['M', 'F', 'U'], true)) {
            $query->andWhere('p.gender = :gender')->setParameter('gender', $gender);
        }

        $categorySlug = $request->query->get('category');
        if (is_string($categorySlug) && $categorySlug !== '') {
            $category = $this->entityManager->getRepository(Category::class)->findOneBy(['slug' => $categorySlug]);
            $categoryIds = $category ? $this->categoryTreeIds($category) : [];
            $query->andWhere('IDENTITY(p.category) IN (:categoryIds)')->setParameter('categoryIds', $categoryIds ?: [0]);
        }

        $minPrice = $request->query->get('min_price');
        if (is_numeric($minPrice)) {
            $query->andWhere('COALESCE(p.discountPrice, p.price) >= :minPrice')->setParameter('minPrice', $minPrice);
        }
        $maxPrice = $request->query->get('max_price');
        if (is_numeric($maxPrice)) {
            $query->andWhere('COALESCE(p.discountPrice, p.price) <= :maxPrice')->setParameter('maxPrice', $maxPrice);
        }

        foreach (['size' => 'v.size', 'color' => 'v.color'] as $parameter => $field) {
            $value = $request->query->get($parameter);
            if (is_string($value) && $value !== '') {
                $query->andWhere(sprintf('LOWER(%s) = :%s', $field, $parameter))->setParameter($parameter, mb_strtolower($value));
            }
        }

        if ($request->query->get('is_featured') === 'true') {
            $query->andWhere('p.isFeatured = true');
        }

        $orderings = [
            'price' => 'p.price',
            'final_price' => 'COALESCE(p.discountPrice, p.price)',
            'created_at' => 'p.createdAt',
            'name' => 'p.name',
        ];
        $ordering = (string) $request->query->get('ordering', '-created_at');
        $descending = str_starts_with($ordering, '-');
        $field = $orderings[ltrim($ordering, '-')] ?? 'p.createdAt';
        $query->orderBy($field, $descending ? 'DESC' : 'ASC');

        $pageSize = min(100, max(1, (int) $request->query->get('page_size', 12)));
        $page = max(1, (int) $request->query->get('page', 1));
        $countQuery = clone $query;
        $total = (int) $countQuery
            ->select('COUNT(DISTINCT p.id)')
            ->resetDQLPart('orderBy')
            ->getQuery()
            ->getSingleScalarResult();
        $pageProducts = $query
            ->setFirstResult(($page - 1) * $pageSize)
            ->setMaxResults($pageSize)
            ->getQuery()
            ->getResult();
        $products = array_map(fn (Product $product) => $this->serializeProduct($product), $pageProducts);

        return $this->paginate($products, $request, $total, true);
    }

    #[Route('/api/products/products/featured/', methods: ['GET'])]
    public function featured(): JsonResponse
    {
        $products = $this->entityManager->getRepository(Product::class)->findBy(
            ['isActive' => true, 'isFeatured' => true],
            ['createdAt' => 'DESC'],
            8,
        );

        return new JsonResponse(array_map(fn (Product $product) => $this->serializeProduct($product), $products));
    }

    #[Route('/api/products/products/new_arrivals/', methods: ['GET'])]
    public function newArrivals(): JsonResponse
    {
        $products = $this->entityManager->getRepository(Product::class)->findBy(['isActive' => true], ['createdAt' => 'DESC'], 12);

        return new JsonResponse(array_map(fn (Product $product) => $this->serializeProduct($product), $products));
    }

    #[Route('/api/products/products/search/', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $request->query->set('search', (string) $request->query->get('q', ''));

        return $this->products($request);
    }

    #[Route('/api/products/products/by_gender/', methods: ['GET'])]
    public function byGender(Request $request): JsonResponse
    {
        $gender = strtoupper((string) $request->query->get('gender', ''));
        if (!in_array($gender, ['M', 'F', 'U'], true)) {
            return new JsonResponse(['error' => 'Genre invalide. Utilisez M, F ou U.'], 400);
        }
        $request->query->set('gender', $gender);

        return $this->products($request);
    }

    #[Route('/api/products/products/{slug}/', requirements: ['slug' => '(?!featured$|new_arrivals$|search$|by_gender$)[^/]+'], methods: ['GET'])]
    public function product(string $slug): JsonResponse
    {
        $product = $this->entityManager->getRepository(Product::class)->findOneBy(['slug' => $slug, 'isActive' => true]);
        if (!$product) {
            return new JsonResponse(['detail' => 'Produit non trouvé.'], 404);
        }

        return new JsonResponse($this->serializeProduct($product));
    }

    #[Route('/api/products/products/{slug}/related/', methods: ['GET'])]
    public function related(string $slug): JsonResponse
    {
        $product = $this->entityManager->getRepository(Product::class)->findOneBy(['slug' => $slug, 'isActive' => true]);
        if (!$product) {
            return new JsonResponse(['detail' => 'Produit non trouvé.'], 404);
        }

        $related = $this->entityManager->createQueryBuilder()
            ->select('p')->from(Product::class, 'p')
            ->where('p.category = :category')->andWhere('p.gender = :gender')->andWhere('p.id != :id')->andWhere('p.isActive = true')
            ->setParameters(['category' => $product->getCategory(), 'gender' => $product->getGender(), 'id' => $product->getId()])
            ->setMaxResults(8)->getQuery()->getResult();

        return new JsonResponse(array_map(fn (Product $item) => $this->serializeProduct($item), $related));
    }

    private function serializeCategory(Category $category): array
    {
        $children = array_filter($category->getChildren()->toArray(), static fn (Category $child) => $child->isActive());

        return [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'slug' => $category->getSlug(),
            'gender' => $category->getGender(),
            'image' => ImageUrl::resolve($category->getImage()),
            'description' => $category->getDescription(),
            'children' => array_map(fn (Category $child) => $this->serializeCategory($child), array_values($children)),
        ];
    }

    private function serializeProduct(Product $product): array
    {
        $images = array_map(static fn (ProductImage $image) => [
            'id' => $image->getId(),
            'image' => ImageUrl::resolve($image->getImage()),
            'is_primary' => $image->isPrimary(),
            'alt_text' => $image->getAltText(),
        ], $product->getImages()->toArray());
        $variants = array_map(static fn (ProductVariant $variant) => [
            'id' => $variant->getId(),
            'size' => $variant->getSize(),
            'color' => $variant->getColor(),
            'sku' => $variant->getSku(),
            'stock' => $variant->getStock(),
            'price_adjustment' => $variant->getPriceAdjustment(),
            'final_price' => $variant->getFinalPrice(),
        ], $product->getVariants()->toArray());
        $primary = null;
        foreach ($images as $image) {
            if ($image['is_primary']) {
                $primary = $image['image'];
                break;
            }
        }
        $primary ??= $images[0]['image'] ?? null;

        return [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'slug' => $product->getSlug(),
            'category' => $product->getCategory()->getId(),
            'category_name' => $product->getCategory()->getName(),
            'gender' => $product->getGender(),
            'description' => $product->getDescription(),
            'price' => $product->getPrice(),
            'discount_price' => $product->getDiscountPrice(),
            'final_price' => $product->getFinalPrice(),
            'stock' => $product->getStock(),
            'is_active' => $product->isActive(),
            'is_featured' => $product->isFeatured(),
            'images' => $images,
            'variants' => $variants,
            'primary_image' => $primary,
            'created_at' => $product->getCreatedAt()->format(DATE_ATOM),
        ];
    }

    private function categoryTreeIds(Category $category): array
    {
        $ids = [$category->getId()];
        foreach ($category->getChildren() as $child) {
            if ($child->isActive()) {
                $ids = [...$ids, ...$this->categoryTreeIds($child)];
            }
        }

        return $ids;
    }

    private function paginate(array $items, Request $request, ?int $knownTotal = null, bool $alreadyPaginated = false): JsonResponse
    {
        $pageSize = min(100, max(1, (int) $request->query->get('page_size', 12)));
        $page = max(1, (int) $request->query->get('page', 1));
        $total = $knownTotal ?? count($items);
        $base = $request->getPathInfo();
        $query = $request->query->all();
        $urlForPage = static function (int $number) use ($base, $query): string {
            $query['page'] = $number;
            return $base.'?'.http_build_query($query);
        };

        return new JsonResponse([
            'count' => $total,
            'next' => $page * $pageSize < $total ? $urlForPage($page + 1) : null,
            'previous' => $page > 1 ? $urlForPage($page - 1) : null,
            'results' => $alreadyPaginated ? $items : array_slice($items, ($page - 1) * $pageSize, $pageSize),
        ]);
    }
}
