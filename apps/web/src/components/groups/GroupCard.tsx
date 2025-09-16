import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Group } from '@/types';

const groupCardVariants = cva('group cursor-pointer', {
  variants: {
    variant: {
      default: 'hover:shadow-lg transition-all duration-200',
      compact: 'hover:shadow-md',
      list: 'hover:bg-muted/50',
    },
    size: {
      default: '',
      sm: 'text-sm',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface GroupCardProps extends VariantProps<typeof groupCardVariants> {
  group: Group;
  className?: string;
  showActions?: boolean;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onLeave?: (group: Group) => void;
}

export function GroupCard({
  group,
  variant,
  size,
  className,
  showActions = true,
  onEdit,
  onDelete,
  onLeave,
}: GroupCardProps) {
  const totalExpenses = group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const memberCount = group.members?.length || 0;
  const averagePerMember = memberCount > 0 ? totalExpenses / memberCount : 0;
  const lastActivity = group.expenses?.[0]?.createdAt || group.updatedAt;

  // Calculate user's balance (mock calculation)
  const userBalance = Math.random() * 200 - 100; // This should come from real data
  const balanceColor =
    userBalance > 0 ? 'text-success-600' : userBalance < 0 ? 'text-danger-600' : 'text-neutral-600';
  const BalanceIcon = userBalance > 0 ? TrendingUp : userBalance < 0 ? TrendingDown : Minus;

  const renderCompactView = () => (
    <Card variant="default" className={cn(groupCardVariants({ variant, size }), className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {group.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{group.name}</h3>
              <p className="text-xs text-muted-foreground">
                {memberCount} miembros • {group.expenses?.length || 0} gastos
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('text-sm font-medium', balanceColor)}>
              {formatCurrency(Math.abs(userBalance), group.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {userBalance > 0 ? 'Te deben' : userBalance < 0 ? 'Debes' : 'Equilibrado'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListView = () => (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors',
        className
      )}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
          <span className="text-lg font-semibold text-primary-700">
            {group.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {memberCount}
            </span>
            <span className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              {group.expenses?.length || 0}
            </span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(lastActivity)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className={cn('font-medium', balanceColor)}>
            {formatCurrency(Math.abs(userBalance), group.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            {userBalance > 0 ? 'Te deben' : userBalance < 0 ? 'Debes' : 'Equilibrado'}
          </p>
        </div>
        {showActions && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opciones del grupo</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                sideOffset={4}
                align="end"
              >
                <DropdownMenu.Item
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                  onClick={() => onEdit?.(group)}
                >
                  Editar grupo
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                  onClick={() => onLeave?.(group)}
                >
                  Salir del grupo
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground text-danger-600"
                  onClick={() => onDelete?.(group)}
                >
                  Eliminar grupo
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </div>
  );

  const renderDefaultView = () => (
    <Card variant="elevated" className={cn(groupCardVariants({ variant, size }), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-700">
                {group.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              )}
            </div>
          </div>
          {showActions && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Opciones del grupo</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                  sideOffset={4}
                  align="end"
                >
                  <DropdownMenu.Item
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                    onClick={() => onEdit?.(group)}
                  >
                    Editar grupo
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground"
                    onClick={() => onLeave?.(group)}
                  >
                    Salir del grupo
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground text-danger-600"
                    onClick={() => onDelete?.(group)}
                  >
                    Eliminar grupo
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{memberCount}</p>
            <p className="text-xs text-muted-foreground">Miembros</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{group.expenses?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Gastos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BalanceIcon className={cn('h-4 w-4', balanceColor)} />
            </div>
            <p className={cn('text-2xl font-bold', balanceColor)}>
              {formatCurrency(Math.abs(userBalance), group.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {userBalance > 0 ? 'Te deben' : userBalance < 0 ? 'Debes' : 'Equilibrado'}
            </p>
          </div>
        </div>

        {/* Total and Average */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total gastado:</span>
            <span className="font-medium">{formatCurrency(totalExpenses, group.currency)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-muted-foreground">Promedio por persona:</span>
            <span className="font-medium">{formatCurrency(averagePerMember, group.currency)}</span>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Última actividad:</span>
          <span>{formatDate(lastActivity)}</span>
        </div>
      </CardContent>
    </Card>
  );

  const content =
    variant === 'compact'
      ? renderCompactView()
      : variant === 'list'
        ? renderListView()
        : renderDefaultView();

  return (
    <Link to={`/groups/${group.id}`} className="block">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {content}
      </motion.div>
    </Link>
  );
}
