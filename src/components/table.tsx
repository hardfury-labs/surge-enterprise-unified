import { useState } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import {
  Box, Flex, FlexProps, Icon, Table, TableCellProps, TableColumnHeaderProps, Tbody, Td, Th, Thead, Tr,
} from "@chakra-ui/react";
import {
  ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortDirection, SortingState, useReactTable,
} from "@tanstack/react-table";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  extraHeaders?: JSX.Element;
};

export interface TableMeta {
  sortable?: boolean;
  isNumeric?: boolean;
  thProps?: TableColumnHeaderProps;
  tdProps?: TableCellProps;
}

const SortIndicator = ({ sorted, ...props }: FlexProps & { sorted?: false | SortDirection }) => (
  <Flex flexDirection="column" {...props}>
    <Icon mb={-1} as={AiFillCaretUp} {...(sorted !== "asc" && { color: "gray.300" })} />
    <Icon as={AiFillCaretDown} {...(sorted !== "desc" && { color: "gray.300" })} />
  </Flex>
);

export const DataTable = <Data extends object>({ data, columns, extraHeaders }: DataTableProps<Data>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <Table>
      <Thead>
        {extraHeaders}

        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: TableMeta = header.column.columnDef.meta || {};

              return (
                <Th
                  key={header.id}
                  onClick={(event) => {
                    if (!meta.sortable) return;
                    const handler = header.column.getToggleSortingHandler();
                    handler && handler(event);
                  }}
                  isNumeric={meta.isNumeric}
                  whiteSpace="nowrap"
                  {...meta.thProps}
                >
                  <Box {...(meta.sortable && { display: "flex", alignItems: "center", cursor: "pointer" })}>
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {meta.sortable && <SortIndicator ml={1} sorted={header.column.getIsSorted()} />}
                  </Box>
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
              const meta: TableMeta = cell.column.columnDef.meta || {};

              return (
                <Td key={cell.id} isNumeric={meta.isNumeric} {...meta.tdProps}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
