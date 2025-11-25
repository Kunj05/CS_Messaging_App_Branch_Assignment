import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    _id: string;
    senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
    senderName: string;
    text: string;
    createdAt: string;
}

interface Ticket {
    _id: string;
    status: 'OPEN' | 'ONGOING' | 'CLOSED';
    priority: 'URGENT' | 'NORMAL';
    assignedAgentId?: string;
}

interface CannedResponse {
    _id: string;
    title: string;
    body: string;
}

interface ChatWindowProps {
    ticket: Ticket | null;
    messages: Message[];
    currentAgentName: string | null;
    onSendMessage: (text: string) => Promise<void>;
    onAssign: () => Promise<void>;
    onCloseTicket: () => Promise<void>;
    cannedResponses: CannedResponse[];
}

export function ChatWindow({
    ticket,
    messages,
    currentAgentName,
    onSendMessage,
    onAssign,
    onCloseTicket,
    cannedResponses,
}: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showCanned, setShowCanned] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        await onSendMessage(newMessage);
        setNewMessage('');
        setSending(false);
        setShowCanned(false);
    };

    const handleCannedSelect = (text: string) => {
        setNewMessage(text);
        setShowCanned(false);
    };

    if (!ticket) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground bg-gray-50/50">
                Select a ticket to start chatting
            </div>
        );
    }

    const isAssignedToMe = true; // Simplified for now

    return (
        <Card className="h-full flex flex-col rounded-none border-x-0">
            <CardHeader className="p-4 border-b flex flex-row justify-between items-center bg-white">
                <div>
                    <CardTitle className="text-lg">Chat</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Ticket #{ticket._id.slice(-6)}
                    </p>
                </div>
                <div className="flex gap-2">
                    {ticket.status === 'OPEN' && (
                        <Button size="sm" onClick={onAssign} variant="default">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign to Me
                        </Button>
                    )}
                    {ticket.status === 'ONGOING' && (
                        <Button size="sm" onClick={onCloseTicket} variant="outline" className="text-red-600 hover:text-red-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Close Chat
                        </Button>
                    )}
                    {ticket.status === 'CLOSED' && (
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 disabled:opacity-50">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Chat Closed
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={cn(
                            'flex flex-col max-w-[80%]',
                            msg.senderType === 'AGENT' ? 'ml-auto items-end' : 'mr-auto items-start'
                        )}
                    >
                        <div
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm',
                                msg.senderType === 'AGENT'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white border text-foreground'
                            )}
                        >
                            {msg.text}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                            {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </CardContent>

            {ticket.status === 'OPEN' ? (
                <div className="p-4 border-t bg-white flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        You must assign this ticket to yourself to reply.
                    </p>
                    <Button onClick={onAssign} className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign to Me
                    </Button>
                </div>
            ) : (
                <>
                    {ticket.status !== 'CLOSED' && (
                        <div className="p-4 border-t bg-white relative">
                            {showCanned && (
                                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                    {cannedResponses.map((cr) => (
                                        <button
                                            key={cr._id}
                                            onClick={() => handleCannedSelect(cr.body)}
                                            className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0"
                                        >
                                            <span className="font-medium block">{cr.title}</span>
                                            <span className="text-xs text-muted-foreground truncate block">
                                                {cr.body}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={handleSend} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="pr-8"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCanned(!showCanned)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        title="Canned Responses"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <rect width="18" height="18" x="3" y="3" rx="2" />
                                            <path d="M9 3v18" />
                                            <path d="M15 9h.01" />
                                            <path d="M15 15h.01" />
                                        </svg>
                                    </button>
                                </div>
                                <Button type="submit" disabled={sending || !newMessage.trim()}>
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    )}
                    {ticket.status === 'CLOSED' && (
                        <div className="p-4 border-t bg-white text-center text-muted-foreground text-sm">
                            This chat is closed.
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
