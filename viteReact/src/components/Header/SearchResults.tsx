import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { Bookmark, Calendar, ShoppingCart, Tag, User } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SearchResultsProps } from "../../models/propsModels";
import { SearchResult } from "../../models/searchModels";
import { generateRandomString } from "../../utils/constants";

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
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  const getIcon = (type: string) => {
    switch (type) {
      case "client":
        return <User className="h-6 w-6" />;
      case "agent":
        return <User className="h-6 w-6" />;
      case "article":
        return <ShoppingCart className="h-6 w-6" />;
      case "promo":
        return <Tag className="h-6 w-6" />;
      case "visit":
        return <Calendar className="h-6 w-6" />;
      default:
        return <Bookmark className="h-6 w-6" />;
    }
  };

  const renderResultDetails = (result: SearchResult) => {
    switch (result.type) {
      case "client":
        return (
          <>
            <Typography>
              {t("searchResults.province", { province: result.province })}
            </Typography>
            <Typography>
              {t("searchResults.phone", { phone: result.phone })}
            </Typography>
            <Typography>
              {t("searchResults.paymentMethod", {
                paymentMethod: result.paymentMethod,
              })}
            </Typography>
          </>
        );
      case "agent":
        return (
          <Typography>
            {t("searchResults.agentId", { agentId: result.id })}
          </Typography>
        );
      case "article":
        return (
          <>
            <Typography>
              {t("searchResults.articleId", { articleId: result.articleId })}
            </Typography>
            <Typography>
              {t("searchResults.brand", { brand: result.brand })}
            </Typography>
            <Typography>
              {t("searchResults.lastSoldDate", {
                lastSoldDate: result.lastSoldDate,
              })}
            </Typography>
          </>
        );
      case "promo":
        return (
          <>
            <Typography>
              {t("searchResults.promoType", { promoType: result.promoType })}
            </Typography>
            <Typography>
              {t("searchResults.startDate", {
                startDate: result.startDate.toLocaleDateString(),
              })}
            </Typography>
            <Typography>
              {t("searchResults.endDate", {
                endDate: result.endDate.toLocaleDateString(),
              })}
            </Typography>
            <Typography>
              {t("searchResults.issuedBy", { issuedBy: result.promoIssuedBy })}
            </Typography>
          </>
        );
      case "visit":
        return (
          <>
            <Typography>
              {t("searchResults.date", {
                date: result.date.toLocaleDateString(),
              })}
            </Typography>
            <Typography>
              {t("searchResults.status", {
                status: result.pending
                  ? "Pending"
                  : result.completed
                  ? "Completed"
                  : "Scheduled",
              })}
            </Typography>
            <Typography>
              {t("searchResults.issuedBy", { issuedBy: result.visitIssuedBy })}
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4" ref={resultsRef}>
      {results.length > 0 ? (
        results.map((result, index) => (
          <motion.div
            key={`${result.id}-${generateRandomString()}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                index === selectedIndex ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onSelect(result)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
              }}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="bg-gradient-to-br from-blue-400 to-purple-500">
                  {getIcon(result.type)}
                </Avatar>
                <Box>
                  <Typography className="text-lg font-semibold">
                    {result.name}
                  </Typography>
                  <Typography className="text-sm text-gray-500">
                    {t(`searchResults.type.${result.type}`)}
                  </Typography>
                </Box>
              </CardHeader>
              <CardContent>
                <Box className="space-y-2">{renderResultDetails(result)}</Box>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="text-center p-4">
          <Typography>{t("searchResults.noResults")}</Typography>
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
