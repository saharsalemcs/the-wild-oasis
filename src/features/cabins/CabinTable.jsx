import Spinner from "../../ui/Spinner";
import CabinRow from "./CabinRow";
import { useCabins } from "./useCabins";
import Table from "../../ui/Table";
import { useSearchParams } from "react-router-dom";
import Empty from "../../ui/Empty";

function CabinTable() {
  const { isLoading, cabins = [] } = useCabins();
  const [searchParams] = useSearchParams();

  // 1. FILTER
  const currentFilterValue = searchParams.get("discount") || "all";
  let filteredCabins;

  if (currentFilterValue === "all") filteredCabins = cabins;
  if (currentFilterValue === "no-discount")
    filteredCabins = cabins.filter((cabin) => cabin.discount === 0);
  if (currentFilterValue === "with-discount")
    filteredCabins = cabins.filter((cabin) => cabin.discount > 0);

  // 2. SORT
  const sortBy = searchParams.get("sortBy") || "Sort by name (A-Z)";
  const [field, direction] = sortBy.split("-");
  const modifier = direction === "asc" ? 1 : -1;
  const sortedCabins = filteredCabins.sort((a, b) => {
    if (typeof a[field] === "string")
      return a[field].localeCompare(b[field]) * modifier;

    return (a[field] - b[field]) * modifier;
  });

  if (isLoading) return <Spinner />;

  if (!cabins.length) return <Empty resourceName="Cabins" />;

  return (
    <Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
      <Table.Header>
        <div></div>
        <div>Cabin</div>
        <div>Capacity</div>
        <div>Price</div>
        <div>Discount</div>
        <div></div>
      </Table.Header>

      <Table.Body
        // data={cabins}
        data={sortedCabins}
        render={(cabin) => <CabinRow key={cabin.id} cabin={cabin} />}
      />
    </Table>
  );
}

export default CabinTable;
