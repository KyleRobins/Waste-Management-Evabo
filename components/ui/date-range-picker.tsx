"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  onSelect?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  onSelect,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onSelect) {
      onSelect(range);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start gap-1.5 text-left font-normal",
              "bg-background border-neutral-800 hover:bg-neutral-900",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-black border border-neutral-800"
          align="start"
        >
          <style jsx global>{`
            /* Dark calendar theme */
            .rdp {
              --rdp-cell-size: 40px !important;
              --rdp-accent-color: #3182ce !important;
              --rdp-background-color: #2d3748 !important;
              margin: 0 !important;
            }

            .rdp-months {
              background: #000 !important;
            }

            .rdp-caption {
              padding: 0 !important;
              margin: 0 0 8px 0 !important;
            }

            .rdp-caption_label {
              font-size: 16px !important;
              font-weight: 600 !important;
              color: white !important;
            }

            .rdp-nav_button {
              color: white !important;
            }

            .rdp-head_cell {
              font-weight: 600 !important;
              color: #718096 !important;
              font-size: 0.8rem !important;
            }

            .rdp-day {
              color: white !important;
              font-weight: 500 !important;
              font-size: 14px !important;
            }

            .rdp-day_today:not(.rdp-day_outside) {
              background-color: #2d3748 !important;
            }

            .rdp-day_selected:not(.rdp-day_outside) {
              background-color: #3182ce !important;
              color: white !important;
              font-weight: 600 !important;
            }

            .rdp-day:hover:not(.rdp-day_outside, .rdp-day_selected) {
              background-color: #2d3748 !important;
            }

            .rdp-day_outside {
              opacity: 0.4 !important;
            }

            .rdp-day_range_start:not(.rdp-day_outside),
            .rdp-day_range_end:not(.rdp-day_outside) {
              background-color: #3182ce !important;
              color: white !important;
              font-weight: 600 !important;
            }

            .rdp-day_range_middle {
              background-color: rgba(49, 130, 206, 0.4) !important;
            }
          `}</style>

          <div className="border-b border-neutral-800 p-3">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Select date range</h3>
              <Button
                variant="ghost"
                className="h-8 px-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800"
                onClick={() => {
                  const now = new Date();
                  const thirtyDaysAgo = new Date(now);
                  thirtyDaysAgo.setDate(now.getDate() - 30);

                  const range = {
                    from: thirtyDaysAgo,
                    to: now,
                  };
                  setDate(range);
                  if (onSelect) onSelect(range);
                }}
              >
                Last 30 days
              </Button>
            </div>
          </div>

          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="bg-black border-none p-3"
          />

          <div className="p-3 border-t border-neutral-800 flex justify-between">
            <Button
              variant="outline"
              className="text-white bg-transparent border-neutral-700 hover:bg-neutral-800 hover:text-white"
              onClick={() => {
                setDate(undefined);
                if (onSelect) onSelect(undefined);
              }}
            >
              Reset
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (!date) {
                  const now = new Date();
                  const yesterday = new Date(now);
                  yesterday.setDate(now.getDate() - 1);

                  const range = {
                    from: yesterday,
                    to: now,
                  };
                  setDate(range);
                  if (onSelect) onSelect(range);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
