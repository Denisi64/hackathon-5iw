import { useEffect, useState } from 'react'
import { Image as ExpoImage } from 'expo-image'
import { Text, View } from 'react-native'
import { IdfmLine, LineMode, idfmService } from '../services/api'

function detectMode(line: string): LineMode {
  if (/^M?\d+[Bb]?$/.test(line)) return 'metro'
  if (/^[A-E]$/.test(line)) return 'rer'
  if (/^T\d/.test(line)) return 'tram'
  if (/^[H-NP-V]$/.test(line)) return 'transilien'
  return 'bus'
}

interface LineBadgeProps {
  line: string
  mode?: LineMode
  size?: number
}

export function LineBadge({ line, mode, size = 36 }: LineBadgeProps) {
  const resolvedMode = mode ?? detectMode(line)
  const [data, setData] = useState<IdfmLine | null>(null)

  useEffect(() => {
    const apiLine = resolvedMode === 'metro' && /^M\d/.test(line) ? line.slice(1) : line
    idfmService.preloadAll().then(() =>
      idfmService.getLine(apiLine, resolvedMode).then(setData)
    )
  }, [line, resolvedMode])

  if (data?.pictoUrl) {
    return <ExpoImage source={{ uri: data.pictoUrl }} style={{ width: size, height: size }} contentFit="contain" />
  }

  const isMetro = resolvedMode === 'metro'
  const isRer = resolvedMode === 'rer'
  const label = /^M\d/.test(line) ? line.slice(1) : line
  const fs = label.length > 3 ? 7 : label.length > 2 ? 9 : label.length > 1 ? 12 : 15
  const borderRadius = isMetro ? size / 2 : isRer ? size * 0.2 : size * 0.28
  const width = isRer ? Math.round(size * 1.15) : size
  const bg = data?.color ?? '#6B7A99'
  const textColor = data?.textColor ?? '#ffffff'

  return (
    <View style={{ width, height: size, borderRadius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: textColor, fontWeight: '900', fontSize: fs, letterSpacing: -0.3 }}>{label}</Text>
    </View>
  )
}
