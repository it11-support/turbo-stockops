import { secureRandomElement, secureRandomInt } from '@/lib/secure-random.js'

function generateRandomProducts(count: any) {
  const categories = ['Tops', 'Bottoms', 'Shoes', 'Accessories'] as const
  const brands = ['ComfortWear', 'StylePro', 'ActiveFit', 'UrbanTrend'] as const
  const colors = ['White', 'Black', 'Blue', 'Red', 'Green'] as const
  const sizes = ['S', 'M', 'L', 'XL'] as const
  const materialOptions = ['100% Cotton', 'Polyester Blend', 'Wool', 'Silk'] as const
  const careInstructionsOptions = [
    ['Machine wash cold', 'Tumble dry low'],
    ['Hand wash', 'Dry clean only'],
    ['Do not bleach', 'Iron on low heat'],
  ]
  const featuresOptions = [
    ['Breathable fabric', 'Ribbed crew neck', 'Short sleeves'],
    ['Water-resistant', 'Stretch fabric', 'Zipper closure'],
    ['Slim fit', 'Quick-dry', 'Reflective details'],
  ]

  const getRandomElement = <T extends readonly unknown[]>(arr: T) =>
    secureRandomElement(arr) as T extends readonly (infer U)[] ? U : never

  const products = []

  for (let i = 1; i <= count; i++) {
    const randomName = `Product ${i}`
    const randomCategory = getRandomElement(categories)
    const randomBrand = getRandomElement(brands)
    const randomMaterial = getRandomElement(materialOptions)
    const randomCareInstructions = getRandomElement(careInstructionsOptions)
    const randomFeatures = getRandomElement(featuresOptions)

    const variants = sizes.map((size) => ({
      size,
      colors: colors.map((color) => ({
        color,
        price: parseFloat(
          (secureRandomInt(15, 30) + secureRandomInt(0, 99) / 100).toFixed(2)
        ),
        originalPrice: parseFloat(
          (secureRandomInt(25, 50) + secureRandomInt(0, 99) / 100).toFixed(2)
        ),
        stockStatus: ['In Stock', 'Out of Stock', 'Low Stock'][
          secureRandomInt(0, 2)
        ],
      })),
    }))

    const promotion = {
      offer: 'Buy 2, Get 1 Free',
      discountPercentage: secureRandomInt(10, 30),
    }

    products.push({
      id: i,
      general: {
        name: randomName,
        description: 'A versatile and stylish product for everyday use.',
        brand: randomBrand,
        category: randomCategory,
      },
      details: {
        material: randomMaterial,
        careInstructions: randomCareInstructions,
        features: randomFeatures,
      },
      variants,
      promotion,
    })
  }

  return products
}

export const products = generateRandomProducts(100)