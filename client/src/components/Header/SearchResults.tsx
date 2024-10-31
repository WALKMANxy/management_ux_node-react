// src/components/SearchResults.tsx
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { SearchResultsProps } from "../../models/propsModels";

const ITEM_HEIGHT = 160;
const MAX_ITEMS_VISIBLE = 5;

const TypeIconBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(1),
  right: theme.spacing(1),
}));

const SearchResults: React.FC<SearchResultsProps> = ({
  onSelect,
  selectedIndex,
  results,
}) => {
  const { t } = useTranslation();
  const listRef = useRef<List>(null);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollToItem(selectedIndex, "smart");
    }
  }, [selectedIndex]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "client":
        return <PersonIcon />;
      case "agent":
        return <SupportAgentIcon />;
      case "article":
        return <WarehouseIcon />;
      case "promo":
        return <LoyaltyIcon />;
      case "visit":
        return <AirplaneTicketIcon />;
      default:
        return null;
    }
  };

  // Define background colors based on the result type
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "agent":
        return "rgba(173, 216, 230, 0.1)";
      case "article":
        return "rgba(255, 165, 0, 0.1)";
      case "promo":
        return "rgba(144, 238, 144, 0.1)";
      case "client":
        return "rgba(255, 255, 255, 0.1)";
      case "visit":
        return "rgba(255, 255, 102, 0.1)";
      default:
        return "rgba(255, 255, 255, 1)";
    }
  };

  const renderRow = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const result = results[index];
      const isSelected = index === selectedIndex;
      const displayId = result.id || t("searchResults.idUnknown");
      const displayPhone = result.phone || t("searchResults.phoneUnknown");
      const displayEmail = result.email || t("searchResults.emailUnknown");
      const displayPromoType =
        result.promoType || t("searchResults.promoTypeUnknown");
      const displayDiscount =
        result.discount || t("searchResults.discountUnknown");
      const displayStartDate = result.startDate
        ? dayjs(result.startDate).format("DD/MM/YYYY")
        : t("searchResults.startDateUnknown");
      const displayEndDate = result.endDate
        ? dayjs(result.endDate).format("DD/MM/YYYY")
        : t("searchResults.endDateUnknown");
      const displayBrand = result.brand || t("searchResults.brandUnknown");
      const displayLastSoldDate = result.lastSoldDate
        ? dayjs(result.lastSoldDate).format("DD/MM/YYYY")
        : t("searchResults.lastSoldDateUnknown");
      const displayDate = result.date
        ? dayjs(result.date).format("DD/MM/YYYY")
        : t("searchResults.dateUnknown");
      const displayCompleted = result.completed
        ? t("searchResults.yes")
        : t("searchResults.no");
      const displayIssuedBy =
        result.visitIssuedBy || t("searchResults.issuedByUnknown");

      return (
        <Box
          style={style}
          key={`${result.type}-${result.id}`}
          onClick={() => onSelect(result)}
          sx={{
            cursor: "pointer",
            height: "100%",
            position: "relative",
            borderRadius: 2,
            py: 0.5,
            zIndex: 1001,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              position: "relative",
              height: "100%",
              borderRadius: 2,
              boxShadow: "none",
              backgroundColor: isSelected
                ? "rgba(0, 0, 0, 0.08)"
                : getBackgroundColor(result.type),
              overflow: "hidden",
              "&:hover": {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" noWrap>
                {result.type === "visit"
                  ? t("searchResults.visitFor", { resultName: result.name })
                  : result.name}
              </Typography>

              {/* Display based on type */}
              {result.type === "agent" && (
                <>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.id")}: {displayId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.phone")}: {displayPhone}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.email")}: {displayEmail}
                  </Typography>
                </>
              )}

              {result.type === "promo" && (
                <>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.id")}: {displayId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.promoType")}: {displayPromoType}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.discount")}: {displayDiscount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.startDate")}: {displayStartDate}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.endDate")}: {displayEndDate}
                  </Typography>
                </>
              )}

              {result.type === "client" && (
                <>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.id")}: {displayId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.province")}:{" "}
                    {result.province || t("searchResults.provinceUnknown")}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.phone")}: {displayPhone}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.paymentMethod")}:{" "}
                    {result.paymentMethod ||
                      t("searchResults.paymentMethodUnknown")}
                  </Typography>
                </>
              )}
              {/* Display based on type */}
              {result.type === "article" && (
                <>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.articleId")}: {displayId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.brand")}: {displayBrand}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.lastSoldDate")}: {displayLastSoldDate}
                  </Typography>
                </>
              )}

              {result.type === "visit" && (
                <>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.visitReason")}: {result.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.date")}: {displayDate}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.completed")}: {displayCompleted}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {t("searchResults.issuedBy")}: {displayIssuedBy}
                  </Typography>
                </>
              )}

              {/* Type Icon */}
              <TypeIconBox>{getTypeIcon(result.type)}</TypeIconBox>
            </CardContent>
          </Card>
        </Box>
      );
    },
    [results, selectedIndex, onSelect, t]
  );

  const listHeight = useMemo(() => {
    return results.length < MAX_ITEMS_VISIBLE
      ? results.length * ITEM_HEIGHT
      : MAX_ITEMS_VISIBLE * ITEM_HEIGHT;
  }, [results.length]);

  return (
    <Box>
      {results.length > 0 ? (
        <List
          height={listHeight}
          itemCount={results.length}
          itemSize={ITEM_HEIGHT}
          width="100%"
          ref={listRef}
          outerElementType={React.forwardRef((props, ref) => (
            <div {...props} ref={ref as React.Ref<HTMLDivElement>} />
          ))}
        >
          {renderRow}
        </List>
      ) : (
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body2">
              {t("searchResults.noResults", "No results found.")}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default memo(SearchResults);
