import MultiGame from './MultiGame'

export default function MultiPage({ params }: { params: { code: string } }) {
  return <MultiGame code={params.code.toUpperCase()} />
}
