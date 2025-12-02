
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Cpu, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const botIntents = {
  initial: {
    id: 'initial',
    message: "Hi, I am here to help you use ReFURRM without stress. You can type a question or tap one of the options below.",
    options: [
      { text: "I need help with donations", next: 'donation_help' },
      { text: "I need Ambassador help", next: 'ambassador_help' },
      { text: "I need help stopping an auction", next: 'hardship_help' },
      { text: "SmartScan or value questions", next: 'smartscan_help' },
      { text: "Marketplace and listings", next: 'marketplace_help' },
      { text: "Account or app issues", next: 'account_tech_help' },
    ]
  },
  donation_help: {
    id: 'donation_help',
    message: "ReFURRM uses donations to fund the LEAN hardship fund and support item returns. You can donate through the app or an Ambassador visit.",
    options: [
      { text: "How donations work", next: 'donation_how_it_works' },
      { text: "What items you accept", next: 'donation_items' },
      { text: "Where the money goes", next: 'donation_money' },
      { text: 'Back to main menu', next: 'initial' },
    ]
  },
  donation_how_it_works: {
    id: 'donation_how_it_works',
    message: "Here is how donations work:\n\n1. You start a donation from the Donate tab or with an Ambassador.\n2. We intake and lightly clean or repair your items.\n3. SmartScan sets a fair resale value.\n4. Items are listed in the ReFURRM Exchange.\n5. Net proceeds support hardship assistance and item returns.",
    options: [{ text: 'Back to donation help', next: 'donation_help' }]
  },
  donation_items: {
    id: 'donation_items',
    message: "You can donate most household goods, furniture, electronics, and clothing. We cannot accept hazardous materials or items that are broken beyond repair.",
    options: [{ text: 'Back to donation help', next: 'donation_help' }]
  },
  donation_money: {
    id: 'donation_money',
    message: "Net proceeds from donation sales are used to:\n\n- Fund LEAN hardship assistance for users facing auctions\n- Cover shipping and costs to return items never meant to be sold\n- Provide supplies for Ambassadors and ethical intake work.",
    options: [{ text: 'Back to donation help', next: 'donation_help' }]
  },
  ambassador_help: {
    id: 'ambassador_help',
    message: "Ambassadors help with storage units, cluttered spaces, and donation projects. They are trained to protect sentimental items and follow ethical sorting.",
    options: [
      { text: "How to request an Ambassador", next: 'ambassador_request' },
      { text: "What Ambassadors do", next: 'ambassador_what_they_do' },
      { text: "How much it costs", next: 'ambassador_cost' },
      { text: 'Back to main menu', next: 'initial' },
    ]
  },
  ambassador_request: {
    id: 'ambassador_request',
    message: "To request an Ambassador:\n\n1. Go to Services → Request an Ambassador Service.\n2. Pick a service type, like clean out or organization.\n3. Enter your ZIP code and project notes.\n4. Confirm the estimate when available.",
    options: [{ text: 'Back to Ambassador help', next: 'ambassador_help' }]
  },
  ambassador_what_they_do: {
    id: 'ambassador_what_they_do',
    message: "Ambassadors:\n\n- Walk the space with you\n- Sort items into Keep, ReFURRBISH, and Donate\n- Flag sentimental items in SmartScan\n- Never remove or discard anything without your permission.",
    options: [{ text: 'Back to Ambassador help', next: 'ambassador_help' }]
  },
  ambassador_cost: {
    id: 'ambassador_cost',
    message: "Costs depend on the project size and your location. You will always see a clear estimate before you confirm your booking.",
    options: [{ text: 'Back to Ambassador help', next: 'ambassador_help' }]
  },
  hardship_help: {
    id: 'hardship_help',
    message: "The LEAN Foundation is our hardship branch. It offers small, targeted help in some cases where users are at risk of losing a unit to auction.",
    options: [
        { text: "Who qualifies", next: 'hardship_qualify' },
        { text: "How to request help", next: 'hardship_request' },
        { text: "How fast can help arrive", next: 'hardship_speed' },
        { text: 'Back to main menu', next: 'initial' },
    ]
  },
  hardship_qualify: {
    id: 'hardship_qualify',
    message: "Potentially eligible users are:\n\n- Active ReFURRM users\n- At real risk of a storage auction or loss of key belongings\n- Able to provide basic proof of their situation.\n\nFunding is limited and not guaranteed, but every request is reviewed.",
    options: [{ text: 'Back to hardship help', next: 'hardship_help' }]
  },
  hardship_request: {
    id: 'hardship_request',
    message: "To request hardship help:\n\n1. Go to Account → Help → Request Hardship Review.\n2. Answer a few short questions about your storage situation.\n3. Upload any notices you have if possible.\n\nA human will review your case as soon as they can.",
    options: [{ text: 'Back to hardship help', next: 'hardship_help' }]
  },
  hardship_speed: {
    id: 'hardship_speed',
    message: "When funding is available and your case is approved, some support can be released within 24 to 48 hours. Timing depends on partners and your storage provider.",
    options: [{ text: 'Back to hardship help', next: 'hardship_help' }]
  },
  smartscan_help: {
    id: 'smartscan_help',
    message: "SmartScan helps you check item value and UPC deals using live resale data. It is a strong guide, not a guarantee.",
    options: [
        { text: "How to use Verify Value", next: 'smartscan_verify' },
        { text: "How to use UPC Checker", next: 'smartscan_upc' },
        { text: "Why value might look off", next: 'smartscan_value_off' },
        { text: 'Back to main menu', next: 'initial' },
    ]
  },
  smartscan_verify: {
    id: 'smartscan_verify',
    message: "To use Verify Value:\n\n1. Open SmartScan → Verify Value.\n2. Upload a photo or enter the item name and condition.\n3. Choose the context, like yard sale or storage unit.\n4. Submit to see the estimated resale range.",
    options: [{ text: 'Back to SmartScan help', next: 'smartscan_help' }]
  },
  smartscan_upc: {
    id: 'smartscan_upc',
    message: "To use the UPC Checker:\n\n1. Open UPC Checker from the main menu.\n2. Enter the barcode numbers and the asking price.\n3. The AI will analyze the deal and show you the potential profit.",
    options: [{ text: 'Back to SmartScan help', next: 'smartscan_help' }]
  },
  smartscan_value_off: {
    id: 'smartscan_value_off',
    message: "Values can seem off if:\n\n- The photo is blurry or unclear.\n- The item is very rare and has little public sales data.\n- The market for the item has changed very recently.",
    options: [{ text: 'Back to SmartScan help', next: 'smartscan_help' }]
  },
  marketplace_help: {
    id: 'marketplace_help',
    message: "The ReFURRM Exchange is our marketplace for your items and ReFURRBISHED inventory.",
    options: [
        { text: "How to list an item", next: 'marketplace_list' },
        { text: "Edit or update a listing", next: 'marketplace_edit' },
        { text: "What Sentimental Hold means", next: 'marketplace_hold' },
        { text: 'Back to main menu', next: 'initial' },
    ]
  },
  marketplace_list: {
    id: 'marketplace_list',
    message: "To list an item:\n\n1. Tap “List an Item” on the dashboard.\n2. Upload a photo and confirm the condition.\n3. The AI will generate a title and description for you to review.\n4. Set your price and publish to the Exchange.",
    options: [{ text: 'Back to Marketplace help', next: 'marketplace_help' }]
  },
  marketplace_edit: {
    id: 'marketplace_edit',
    message: "You can edit your listing's price, description, and photos at any time from your Account page as long as the item has not been sold.",
    options: [{ text: 'Back to Marketplace help', next: 'marketplace_help' }]
  },
  marketplace_hold: {
    id: 'marketplace_hold',
    message: "Sentimental Hold means that an item might belong to an original owner. It is frozen from sale while we investigate and try to reconnect it.",
    options: [{ text: 'Back to Marketplace help', next: 'marketplace_help' }]
  },
  account_tech_help: {
    id: 'account_tech_help',
    message: "Let us see if we can fix this quickly.",
    options: [
        { text: "Login issues", next: 'tech_login' },
        { text: "Photo or camera problems", next: 'tech_camera' },
        { text: "Something else is broken", next: 'tech_other' },
        { text: 'Back to main menu', next: 'initial' },
    ]
  },
  tech_login: {
    id: 'tech_login',
    message: "First steps:\n\n1. Confirm your email and password.\n2. Try a password reset from the login screen.\n\nIf that fails, I can help open a support ticket.",
    options: [{ text: 'Open a support ticket', next: 'escalate' }, { text: 'Back to technical help', next: 'account_tech_help' }]
  },
  tech_camera: {
    id: 'tech_camera',
    message: "If your camera isn't working:\n\n1. Make sure you've given the app camera permissions in your device settings.\n2. Try restarting the app.\n3. Ensure your internet connection is stable for photo uploads.",
    options: [{ text: 'Back to technical help', next: 'account_tech_help' }]
  },
  tech_other: {
    id: 'tech_other',
    message: "It sounds like you need a human to step in. I can send this to support for review.",
    options: [{ text: 'Create a support ticket', next: 'escalate' }]
  },
  escalate: {
    id: 'escalate',
    message: "Thank you. Your request has been sent to the support team. They will respond inside the app or by email as soon as they can.",
    options: [{ text: 'Start over', next: 'initial' }]
  }
};

type ConversationTurn = {
  speaker: 'bot' | 'user';
  text: string;
};

export function Chatbot() {
  const [currentIntent, setCurrentIntent] = useState('initial');
  const [history, setHistory] = useState<ConversationTurn[]>([]);

  const handleOptionClick = (nextIntent: string, userText: string) => {
    setHistory([...history, { speaker: 'user', text: userText }]);
    setCurrentIntent(nextIntent);
  };

  const intent = botIntents[currentIntent as keyof typeof botIntents] || botIntents.initial;

  return (
    <Card className="w-full shadow-2xl">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback><Cpu /></AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg p-3 max-w-[85%]">
              <p className="text-sm whitespace-pre-wrap">{botIntents.initial.message}</p>
            </div>
          </div>
          {/* Conversation History */}
          {history.map((turn, index) => (
            <div key={index} className={`flex items-start gap-3 ${turn.speaker === 'user' ? 'justify-end' : ''}`}>
              {turn.speaker === 'bot' && (
                <Avatar>
                  <AvatarFallback><Cpu /></AvatarFallback>
                </Avatar>
              )}
              <div className={`${turn.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3 max-w-[85%]`}>
                 <p className="text-sm whitespace-pre-wrap">{turn.text}</p>
              </div>
               {turn.speaker === 'user' && (
                <Avatar>
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {/* Current Bot Message */}
          {currentIntent !== 'initial' && (
             <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback><Cpu /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm whitespace-pre-wrap">{intent.message}</p>
                </div>
              </div>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-4">
        <div className="flex flex-wrap gap-2 w-full justify-center">
          {intent.options.map((option) => (
            <Button
              key={option.next}
              variant="outline"
              onClick={() => handleOptionClick(option.next, option.text)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
