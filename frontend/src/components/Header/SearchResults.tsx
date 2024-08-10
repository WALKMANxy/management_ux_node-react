import { Card, CardContent, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SearchResultsProps } from "../../models/propsModels";
import { generateRandomString } from "../../utils/constants";
import "./SearchResults.module.css";

const SearchResults: React.FC<SearchResultsProps> = ({
  onSelect,
  selectedIndex,
  results,
}) => {
  const { t } = useTranslation();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="search-results" ref={resultsRef}>
      {results.length > 0 ? (
        results.map((result, index) => (
          <Card
            key={`${result.id}-${generateRandomString()}`}
            className={`search-result-item ${
              index === selectedIndex ? "selected" : ""
            }`}
            onClick={() => onSelect(result)} // Pass the entire result object
            sx={{ marginBottom: 2 }}
          >
            <CardContent>
              <Typography variant="h6">{result.name}</Typography>
              {result.type === "article" && (
                <>
                  <Typography variant="body2">
                    {t("searchResults.articleId", {
                      articleId: result.articleId,
                    })}
                  </Typography>
                  <Typography variant="body2">
                    {t("searchResults.brand", { brand: result.brand })}
                  </Typography>
                  <Typography variant="body2">
                    {t("searchResults.lastSoldDate", {
                      lastSoldDate: result.lastSoldDate,
                    })}
                  </Typography>
                </>
              )}
              {result.type === "client" && (
                <>
                  <Typography variant="body2">
                    {t("searchResults.province", { province: result.province })}
                  </Typography>
                  <Typography variant="body2">
                    {t("searchResults.phone", { phone: result.phone })}
                  </Typography>
                  <Typography variant="body2">
                    {t("searchResults.paymentMethod", {
                      paymentMethod: result.paymentMethod,
                    })}
                  </Typography>
                </>
              )}
              {result.type === "promo" && (
                <>
                  <Typography variant="body2">
                    {t("searchResults.discountAmount", {
                      discountAmount: result.discountAmount,
                    })}
                  </Typography>
                  <Typography variant="body2">
                    {t("searchResults.startDate", {
                      startDate: result.startDate,
                    })}
                  </Typography>
                  <Typography variant="body2">
                    {t("searchResults.endDate", { endDate: result.endDate })}
                  </Typography>
                </>
              )}
              <Typography variant="body2">
                {t("searchResults.type", { type: result.type })}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="search-result-item" sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body2">
              {t("searchResults.noResults")}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
