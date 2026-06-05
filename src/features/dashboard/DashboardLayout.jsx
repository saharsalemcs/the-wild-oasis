import styled from "styled-components";
import { useRecentBookings } from "./useRecentBookings";
import { useRecentStays } from "./useRecentStays";
import Spinner from "../../ui/Spinner";

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

function DashboardLayout() {
  const { bookings, isLoading: isLoadingBookings } = useRecentBookings();
  const { isLoading: isloadingStays, stays, confirmedStays } = useRecentStays();

  if (isLoadingBookings || isloadingStays) return <Spinner />;

  return <StyledDashboardLayout></StyledDashboardLayout>;
}

export default DashboardLayout;
