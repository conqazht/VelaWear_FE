"use client";

import { siBarclays, siBitcoin, siEthereum, siHsbc, siRevolut } from "simple-icons";

import { useI18n } from "@/components/providers/i18n-provider";
import { SimpleIcon } from "@/components/simple-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";

const walletCards = [
  {
    id: 1,
    bank: "Revolut Premium",
    last4: "4182",
    balance: 12450.6,
    icon: siRevolut,
    iconColor: "fill-foreground",
  },
  {
    id: 2,
    bank: "HSBC Bank",
    last4: "1004",
    balance: 3200.11,
    icon: siHsbc,
    iconColor: "fill-foreground",
  },

  {
    id: 4,
    bank: "Barclays Bank",
    last4: "9912",
    balance: 1450,
    icon: siBarclays,
    iconColor: "fill-foreground",
  },
];

const cryptoAssets = [
  {
    id: 1,
    name: "Bitcoin",
    vault: "Binance",
    balance: 0.42,
    symbol: "BTC",
    usdValue: 24150,
    icon: siBitcoin,
  },
  {
    id: 2,
    name: "Ethereum",
    vault: "MetaMask",
    balance: 4.85,
    symbol: "ETH",
    usdValue: 12420.1,
    icon: siEthereum,
  },
];

export function Wallet() {
  const { locale, t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t("admin.finance.wallet.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {walletCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm leading-none font-medium">
                    {card.bank} • **** {card.last4}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs font-normal">
                  {formatCurrency(card.balance, locale, "USD")}
                </span>
              </div>
              <div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-md border">
                <SimpleIcon icon={card.icon} />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {cryptoAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm leading-none font-medium">
                    {asset.name} • {asset.vault}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs font-normal">
                  {formatNumber(asset.balance, locale, { maximumFractionDigits: 8 })} {asset.symbol}{" "}
                  • {formatCurrency(asset.usdValue, locale, "USD")}
                </span>
              </div>
              <div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-md border">
                <SimpleIcon icon={asset.icon} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-[10px] font-medium">
              {t("admin.finance.wallet.physicalVault")}{" "}
              <span className="text-foreground">Ledger Nano X</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] font-bold tracking-widest text-green-500 uppercase">
              {t("admin.finance.wallet.airGapped")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
