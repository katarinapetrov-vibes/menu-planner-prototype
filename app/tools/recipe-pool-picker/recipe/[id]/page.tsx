import RecipeDetailClient from './RecipeDetailClient'

export function generateStaticParams() {
  return ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'].map(id => ({ id }))
}

export default function RecipeDetailPage() {
  return <RecipeDetailClient />
}
