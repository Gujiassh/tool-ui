"use client";

import { Button, Card, cn } from "./_adapter";
import type { Item } from "./schema";

interface ItemCardProps {
  item: Item;
  onItemClick?: (itemId: string) => void;
  onItemAction?: (itemId: string, actionId: string) => void;
}

export function ItemCard({ item, onItemClick, onItemAction }: ItemCardProps) {
  const { id, name, subtitle, image, color, actions } = item;
  const isCardInteractive = typeof onItemClick === "function";

  const handleCardClick = () => {
    if (!isCardInteractive) return;
    onItemClick?.(id);
  };

  const handleActionClick = (actionId: string) => {
    onItemAction?.(id, actionId);
  };

  return (
    <Card
      className={cn(
        "group @container/card relative flex @lg:w-56 w-52 min-w-48 flex-col gap-0 self-stretch overflow-clip rounded-md p-0",
        isCardInteractive && "cursor-pointer hover:shadow",
        "touch-manipulation",
      )}
    >
      {isCardInteractive && (
        <button
          type="button"
          aria-label={`View item: ${name}`}
          className={cn(
            "absolute inset-0 z-10 rounded-md",
            "cursor-pointer touch-manipulation",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          onClick={handleCardClick}
        />
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "h-full w-full object-cover transition-transform duration-200",
              isCardInteractive && "group-hover:scale-105",
            )}
          />
        ) : (
          <div
            className={cn(
              "h-full w-full transition-transform duration-200",
              isCardInteractive && "group-hover:scale-105",
            )}
            style={color ? { backgroundColor: color } : undefined}
            role="img"
            aria-label={name}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 font-medium text-sm leading-tight">
            {name}
          </h3>

          {subtitle && (
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div
            className={cn(
              "relative z-20 mt-auto flex @[176px]/card:flex-row flex-col-reverse gap-2 pt-2",
            )}
          >
            {actions.map((action) => (
              <Button
                key={action.id}
                type="button"
                variant={action.variant ?? "default"}
                size="sm"
                disabled={action.disabled}
                className="@[176px]/card:h-8 min-h-11 @[176px]/card:w-auto w-full @[176px]/card:flex-1 px-3 md:min-h-8"
                onClick={() => handleActionClick(action.id)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
