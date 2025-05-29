'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function EditTextDialog({
    greeting,
    setGreeting,
    poem,
    setPoem,
    recipientName,
}) {
    const [open, setOpen] = useState(false)
    const [tempGreeting, setTempGreeting] = useState(greeting)
    const [tempPoem, setTempPoem] = useState(poem) // Added setTempPoem

    const handleSave = () => {
        setGreeting(tempGreeting)
        setPoem(tempPoem)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mt-2">
                    Edit Greeting & Poem
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Greeting and Poem</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="greeting">Greeting</Label>
                        <Input
                            id="greeting"
                            value={tempGreeting}
                            onChange={(e) => setTempGreeting(e.target.value)}
                            placeholder={`e.g., Dearest ${recipientName || 'Recipient'}`}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="poem">Poem</Label>
                        <Textarea
                            id="poem"
                            value={tempPoem}
                            onChange={(e) => setTempPoem(e.target.value)}
                            placeholder="Enter or edit the poem"
                            rows={5}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}