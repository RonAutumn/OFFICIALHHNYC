"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function SyncToAirtableButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [syncStats, setSyncStats] = useState<{
    productsToSync: number
  } | null>(null)

  const handleSync = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to sync products')
      }

      const data = await response.json()
      setSyncStats(data)
      
      if (data.productsToSync === 0) {
        toast.info('No local products to sync')
        setShowConfirmDialog(false)
        return
      }

      // For now, just show a success message
      toast.success(`Found ${data.productsToSync} products to sync`)
    } catch (error) {
      console.error('Error syncing products:', error)
      toast.error('Failed to sync products')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Cloud className="mr-2 h-4 w-4" />
        )}
        Sync to Airtable
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync to Airtable</DialogTitle>
            <DialogDescription>
              This will sync all local products to Airtable. This action cannot be undone.
              {syncStats && (
                <p className="mt-2 font-medium">
                  Found {syncStats.productsToSync} products to sync.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSync}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 