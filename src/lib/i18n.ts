import { OrderStatus } from '@/types/database'

export const orderStatusArabic: Record<OrderStatus, string> = {
  pending: 'مستني التأكيد',
  confirmed: 'اتأكد',
  preparing: 'بيتجهز',
  ready: 'جاهز',
  completed: 'اتسلّم',
  cancelled: 'اتلغى',
}

export function shortOrderNumber(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export function itemCountLabel(count: number) {
  if (count === 0) return 'مفيش منتجات'
  if (count === 1) return 'منتج واحد'
  if (count === 2) return 'منتجين'
  return `${count} منتجات`
}

const categoryNames: Record<string, string> = {
  'Coffee & Espresso': 'قهوة وإسبريسو',
  'Burgers & Sandwiches': 'برجر وسندوتشات',
  'Desserts & Sweets': 'حلويات',
  'Cold Beverages': 'مشروبات باردة',
}

const categoryDescriptions: Record<string, string> = {
  'Artisan hot and cold specialty coffees crafted with premium beans.': 'قهوة سخنة وباردة معمولة بحبوب مختارة وطعم مظبوط.',
  'Gourmet smashed beef burgers and artisanal toasted brioche sandwiches.': 'برجر وسندوتشات بريوش بجودة عالية وتحضير طازة.',
  'Freshly baked pastries, cheesecakes, and delightful sweet treats.': 'حلويات وتشيز كيك ومخبوزات طازة لكل مزاج.',
  'Refreshing iced teas, mojitos, and natural fruit blends.': 'مشروبات باردة ومنعشة بطعم خفيف ومتوازن.',
}

const productDescriptions: Record<string, string> = {
  'italian-caffe-latte': 'إسبريسو إيطالي مع لبن مبخر وقوام ناعم متوازن.',
  'spanish-iced-latte': 'إسبريسو دبل مع لبن مكثف، تلج، ولبن بارد.',
  'caramel-macchiato': 'لبن مبخر بنكهة الفانيليا مع إسبريسو وصوص كراميل.',
  'double-truffle-smash-burger': 'قطعتين برجر سماش مع جبنة سويس، بصل مكرمل، ومايونيز ترافل.',
  'crispy-buttermilk-chicken-burger': 'فراخ مقرمشة بتتبيلة باترملك مع سلو وصوص عسل مستردة.',
  'san-sebastian-burnt-cheesecake': 'تشيز كيك سان سباستيان كريمي مع صوص شوكولاتة بلجيكي.',
  'nutella-molten-lava-cake': 'كيك شوكولاتة دافي بحشوة نوتيلا سايحة.',
  'passion-fruit-mojito': 'ليمون ونعناع فريش مع باشن فروت وصودا خفيفة.',
}

export function displayCategoryName(name: string) {
  return categoryNames[name] || name
}

export function displayCategoryDescription(description?: string | null) {
  if (!description) return 'قسم مختار بعناية من سيف ستور.'
  return categoryDescriptions[description] || description
}

export function displayProductDescription(slug: string, description?: string | null) {
  return productDescriptions[slug] || description || 'منتج طازة بيتحضر مخصوص لطلبك بجودة سيف ستور.'
}
