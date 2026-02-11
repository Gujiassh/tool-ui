'use client'

import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button'
import { Button } from '@/components/ui/button'
import { Check, Copy as CopyIcon } from 'lucide-react'
import { registryItemUrl } from '@/lib/docs/registry-config'

type RegistryInstallProps = {
  componentId: string
}

export function RegistryInstall({ componentId }: RegistryInstallProps) {
  const url = registryItemUrl(componentId)
  const command = `pnpm dlx shadcn@latest add ${url}`
  const [checked, onClick] = useCopyButton(async () => {
    await navigator.clipboard.writeText(command)
  })

  return (
    <div className="not-prose my-4 flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
      <p className="text-muted-foreground text-sm">
        This installs the component, shared utilities, and required shadcn/ui components.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="flex-1 overflow-x-auto rounded bg-muted px-2 py-1.5 text-sm">
          {command}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClick}
          aria-label="Copy install command"
          className="shrink-0 gap-2"
        >
          {checked ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
          {checked ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
