'use client'

import { Tabs, Tab } from 'fumadocs-ui/components/tabs'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { registryItemUrl } from '@/lib/docs/registry-config'

type QuickStartInstallTabsProps = {
  componentId: string
}

const PACKAGE_MANAGERS = [
  { id: 'npm', command: (url: string) => `npx shadcn@latest add ${url}` },
  { id: 'pnpm', command: (url: string) => `pnpm dlx shadcn@latest add ${url}` },
  { id: 'bun', command: (url: string) => `bunx shadcn@latest add ${url}` },
  { id: 'yarn', command: (url: string) => `yarn dlx shadcn@latest add ${url}` },
] as const

export function QuickStartInstallTabs({ componentId }: QuickStartInstallTabsProps) {
  const url = registryItemUrl(componentId)

  return (
    <Tabs items={PACKAGE_MANAGERS.map((pm) => pm.id)}>
      {PACKAGE_MANAGERS.map((pm) => (
        <Tab key={pm.id}>
          <DynamicCodeBlock
            lang="bash"
            code={pm.command(url)}
            codeblock={{ 'data-line-numbers': true, 'data-line-numbers-start': 1 }}
          />
        </Tab>
      ))}
    </Tabs>
  )
}
