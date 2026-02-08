"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Video,
  MessageCircle,
  Search,
  Copy,
  PlayCircle,
  HelpCircle,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

const tutorials = [
  {
    id: '1',
    title: 'Getting Started with Talk2SQL',
    description: 'Learn the basics of natural language querying',
    duration: '5 min',
    thumbnail: '🎬',
  },
  {
    id: '2',
    title: 'Using Voice Input',
    description: 'Master voice commands for hands-free querying',
    duration: '3 min',
    thumbnail: '🎤',
  },
  {
    id: '3',
    title: 'Creating Reports',
    description: 'Generate and schedule automated reports',
    duration: '7 min',
    thumbnail: '📊',
  },
  {
    id: '4',
    title: 'Advanced Query Techniques',
    description: 'Complex queries and data analysis tips',
    duration: '10 min',
    thumbnail: '🚀',
  },
];

const queryExamples = [
  {
    category: 'Sales',
    examples: [
      { en: 'Show me last week sales', ur: 'Pichle hafte ki sales dikhao' },
      { en: 'Top 5 products by revenue', ur: 'Sabse zyada bikne wale products' },
      { en: 'Monthly sales comparison', ur: 'Monthly sales ka comparison' },
    ],
  },
  {
    category: 'Inventory',
    examples: [
      { en: 'Products with low stock', ur: 'Kam stock wale products' },
      { en: 'Inventory value by category', ur: 'Category wise inventory value' },
      { en: 'Items out of stock', ur: 'Stock khatam items' },
    ],
  },
  {
    category: 'Customers',
    examples: [
      { en: 'New customers this month', ur: 'Is mahine ke naye customers' },
      { en: 'Top 10 customers by orders', ur: 'Sabse zyada order wale customers' },
      { en: 'Customers from Karachi', ur: 'Karachi ke customers' },
    ],
  },
];

const faqs = [
  {
    question: 'How do I use voice input?',
    answer: 'Click the microphone button on the query page, allow microphone access when prompted, and speak your question clearly. The system will transcribe your speech and process the query.',
  },
  {
    question: 'What languages are supported?',
    answer: 'Talk2SQL currently supports English and Roman Urdu. You can switch between languages using the toggle on the query page.',
  },
  {
    question: 'How do I save a query?',
    answer: 'After running a query, click the star icon to save it to your favorites. You can access saved queries from the History page.',
  },
  {
    question: 'Can I edit the generated SQL?',
    answer: 'Yes! Click the edit button in the SQL display panel to modify the generated query before running it. This is useful for advanced users who want more control.',
  },
  {
    question: 'How do I export my data?',
    answer: 'Use the Export button on the results table to download data as CSV or Excel. You can also generate PDF reports from the Reports page.',
  },
  {
    question: 'Why is my query not working?',
    answer: 'Make sure your question is clear and specific. Try rephrasing it or using one of the example queries. If the problem persists, check that you have access to the selected database.',
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });

  const handleCopyExample = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSubmitTicket = () => {
    toast.success('Support ticket submitted');
    setContactForm({ subject: '', message: '' });
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">How can we help?</h2>
        <p className="text-muted-foreground">
          Find answers, tutorials, and support
        </p>
        <div className="relative max-w-md mx-auto mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="tutorials" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-lg mx-auto">
          <TabsTrigger value="tutorials">
            <Video className="h-4 w-4 mr-2" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="examples">
            <BookOpen className="h-4 w-4 mr-2" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* Tutorials */}
        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                    {tutorial.thumbnail}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{tutorial.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {tutorial.duration}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {tutorial.description}
                    </p>
                    <Button variant="outline" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Watch
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Examples */}
        <TabsContent value="examples">
          <div className="space-y-6">
            {queryExamples.map((category) => (
              <Card key={category.category} className="p-6">
                <h3 className="font-semibold mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{example.en}</p>
                        <p className="text-sm text-muted-foreground">{example.ur}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyExample(example.en)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq">
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No matching questions found
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card className="p-6 max-w-lg mx-auto">
            <h3 className="font-semibold text-lg mb-4">Submit a Support Ticket</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmitTicket}
                disabled={!contactForm.subject || !contactForm.message}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
