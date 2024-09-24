// src/components/SearchResults.tsx

import { Box, Card, CardContent, Typography } from "@mui/material";
import React, { memo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { SearchResultsProps } from "../../models/propsModels";
import { generateRandomString } from "../../utils/constants";

const ITEM_HEIGHT = 160; // Adjust based on your design
const MAX_ITEMS_VISIBLE = 5; // Maximum items visible without scrolling

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

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const result = results[index];
    const isSelected = index === selectedIndex;

    return (
      <Box
        style={style}
        key={`${result.id}-${generateRandomString()}`}
        onClick={() => onSelect(result)}
        sx={{
          backgroundColor: isSelected ? "rgba(0, 0, 0, 0.08)" : "transparent",
          cursor: "pointer",
          paddingY: 0.5,
          height: "100%",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            position: "relative",
            height: "100%",
            borderRadius: 2,
            boxShadow: "none",
            backgroundColor: "rgba(255, 255, 255, 1)", // Transparent layer to create the frosted glass effect
            overflow: "hidden", // Ensure the pseudo-element stays within the card
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "inherit", // Inherits the background of the card
              filter: "blur(25px)", // Apply the blur here
              zIndex: -1, // Place the pseudo-element behind the content
            },
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" noWrap>
              {result.name}
            </Typography>
            {result.type === "article" && (
              <>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.articleId", {
                    articleId: result.articleId,
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.brand", { brand: result.brand })}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.lastSoldDate", {
                    lastSoldDate: result.lastSoldDate,
                  })}
                </Typography>
              </>
            )}
            {result.type === "client" && (
              <>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.province", { province: result.province })}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.phone", { phone: result.phone })}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.paymentMethod", {
                    paymentMethod: result.paymentMethod,
                  })}
                </Typography>
              </>
            )}
            {result.type === "promo" && (
              <>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.discountAmount", {
                    discountAmount: result.discount,
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.startDate", {
                    startDate: result.startDate,
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {t("searchResults.endDate", { endDate: result.endDate })}
                </Typography>
              </>
            )}
            <Typography variant="body2" color="textSecondary" noWrap>
              {t("searchResults.type", { type: result.type })}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const listHeight =
    results.length < MAX_ITEMS_VISIBLE
      ? results.length * ITEM_HEIGHT
      : MAX_ITEMS_VISIBLE * ITEM_HEIGHT;

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
