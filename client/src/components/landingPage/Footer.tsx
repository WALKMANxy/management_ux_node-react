//src/components/landingPage/Footer.tsx
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CallIcon from "@mui/icons-material/Call"; // Import the Call icon
import FacebookIcon from "@mui/icons-material/Facebook";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailIcon from "@mui/icons-material/Mail";

import {
  Box,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ModalContent from "./modalContent";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<
    "ourStory" | "privacyPolicy" | "termsOfService" | "team" | null
  >(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:900px)");
  const isSuperMobile = useMediaQuery("(min-width:0px) and (max-width:380px)");
  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  const handleOpenModal = (
    content: "ourStory" | "privacyPolicy" | "termsOfService" | "team"
  ) => {
    setModalContent(content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent(null);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000000",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "auto",
        boxShadow: "0px -4px 8px rgba(0, 0, 0, 0.5)",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      {/* Top Section (90%) */}
      <Box
        sx={{
          flex: "90%",
          pt: isMobile ? 1 : 2,
          px: isMobile ? 1 : isSuperMobile ? 0 : 6,
          pb: isMobile ? 1 : 2,
        }}
      >
        <Grid
          container
          spacing={1}
          direction={isMobile ? "column" : "row"}
          alignItems={isMobile ? "center" : "flex-start"}
        >
          {/* Logo Section */}
          {!isMobile && (
            <Grid item xs={12} sm={isTablet ? 3 : 6}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  flexDirection: isTablet ? "column" : "column",
                  justifyContent: "flex-start",
                  gap: 1,
                }}
                onClick={handleLogoClick}
              >
                <img
                  src="/images/logo-appbar.png"
                  alt="Ricambi Centro Sud Logo"
                  style={{ height: "40px", marginRight: "16px" }}
                />
                <Typography variant="h6" sx={{ color: "#FFFFFF" }}>
                  #RandomCompany
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Grouped Columns: About, Hours, Legal */}
          <Grid item xs={12} sm={isTablet ? 9 : isMobile ? 10 : 6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: isSuperMobile ? 1 : isMobile ? 4 : 4,
                flexWrap: "wrap",
              }}
            >
              {/* ABOUT Column */}
              <Box sx={{}}>
                <Typography
                  variant="h6"
                  fontWeight={300}
                  sx={{
                    mb: 1,
                    borderBottom: "0.5px solid rgba(176,176,176,0.5)",
                    fontSize: isSuperMobile
                      ? "0.8rem"
                      : isMobile
                      ? "0.9rem"
                      : "1rem",
                  }}
                >
                  {t("footer.about")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    mb: 0.5,
                    color: "#b0b0b0",
                    fontSize: isSuperMobile
                      ? "0.65rem"
                      : isMobile
                      ? "0.75rem"
                      : "0.875rem",
                  }}
                  onClick={() => handleOpenModal("ourStory")}
                >
                  <Trans i18nKey="footer.ourStory">Our Story</Trans>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    color: "#b0b0b0",
                    fontSize: isSuperMobile
                      ? "0.65rem"
                      : isMobile
                      ? "0.75rem"
                      : "0.875rem",
                  }}
                  onClick={() => handleOpenModal("team")}
                >
                  <Trans i18nKey="footer.team">Team</Trans>
                </Typography>
              </Box>

              {/* HOURS Column */}
              <Box sx={{ pl: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={300}
                  sx={{
                    mb: 1,
                    borderBottom: "0.5px solid rgba(176,176,176,0.5)",
                    fontSize: isSuperMobile
                      ? "0.8rem"
                      : isMobile
                      ? "0.9rem"
                      : "1rem",
                  }}
                >
                  {t("footer.hours") || "HOURS"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <AccessTimeIcon
                    sx={{
                      mr: 0.5,
                      color: "#b0b0b0",
                      fontSize: isSuperMobile
                        ? "small"
                        : isMobile
                        ? "medium"
                        : "default",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#b0b0b0",
                      fontSize: isSuperMobile
                        ? "0.65rem"
                        : isMobile
                        ? "0.75rem"
                        : "0.875rem",
                    }}
                  >
                    8:30-13:00
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccessTimeIcon
                    sx={{
                      mr: 0.5,
                      color: "#b0b0b0",
                      fontSize: isSuperMobile
                        ? "small"
                        : isMobile
                        ? "medium"
                        : "default",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#b0b0b0",
                      fontSize: isSuperMobile
                        ? "0.65rem"
                        : isMobile
                        ? "0.75rem"
                        : "0.875rem",
                    }}
                  >
                    15:00-18:30
                  </Typography>
                </Box>
              </Box>

              {/* LEGAL Column */}
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={300}
                  sx={{
                    mb: 1,
                    borderBottom: "0.5px solid rgba(176,176,176,0.5)",
                    fontSize: isSuperMobile
                      ? "0.8rem"
                      : isMobile
                      ? "0.9rem"
                      : "1rem",
                  }}
                >
                  {t("footer.legal")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    mb: 0.5,
                    color: "#b0b0b0",
                    fontSize: isSuperMobile
                      ? "0.65rem"
                      : isMobile
                      ? "0.75rem"
                      : "0.875rem",
                  }}
                  onClick={() => handleOpenModal("privacyPolicy")}
                >
                  <Trans i18nKey="footer.privacyPolicy">Privacy Policy</Trans>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    color: "#b0b0b0",
                    fontSize: isSuperMobile
                      ? "0.65rem"
                      : isMobile
                      ? "0.75rem"
                      : "0.875rem",
                  }}
                  onClick={() => handleOpenModal("termsOfService")}
                >
                  <Trans i18nKey="footer.termsOfService">
                    Terms of Service
                  </Trans>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Divider */}
      <Divider
        sx={{
          backgroundColor: "white",
          width: "95%",
          margin: "0 auto",
        }}
      />

      {/* Bottom Section (10%) */}
      <Box
        sx={{
          flex: "10%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 0.5,
          px: isSuperMobile ? 2 : 6,
        }}
      >
        {/* Copyright */}
        <Typography variant="body2" sx={{ flex: 1, textAlign: "left" }}>
          &copy;2024 NEXT_™
        </Typography>

        {/* Social Links */}
        <Box>
          {/* Call IconButton */}
          <IconButton
            href="tel:+390954190006"
            sx={{ color: "green", mr: -1.2 }}
            aria-label="Call"
          >
            <CallIcon
              sx={{
                fontSize: isSuperMobile ? "1rem" : isMobile ? "1.2rem" : null,
              }}
            />
          </IconButton>
          <IconButton
            href="mailto:info@ricambicentrosud.com"
            sx={{ color: "#D44638", mr: -1.4 }}
            aria-label="Email"
          >
            <MailIcon
              sx={{
                fontSize: isSuperMobile ? "1rem" : isMobile ? "1.2rem" : null,
              }}
            />
          </IconButton>

          {/* Google Maps IconButton */}
          <IconButton
            href="https://goo.gl/maps/MFy1cqdn3BbQNmtW6"
            sx={{ color: "#4285F4", mr: -1.3 }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Maps"
          >
            <FmdGoodIcon
              sx={{
                fontSize: isSuperMobile ? "1rem" : isMobile ? "1.2rem" : null,
              }}
            />
          </IconButton>

          {/* Facebook IconButton */}
          <IconButton
            href="https://www.facebook.com/RicambiCentroSud/"
            sx={{ color: "#3b5998", mr: -1.1 }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon
              sx={{
                fontSize: isSuperMobile ? "1rem" : isMobile ? "1.2rem" : null,
              }}
            />
          </IconButton>

          {/* Instagram IconButton */}
          <IconButton
            href="https://www.instagram.com/ricambicentrosud/"
            sx={{ color: "#E1306C", mr: -1.2 }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon
              sx={{
                fontSize: isSuperMobile ? "1rem" : isMobile ? "1.2rem" : null,
              }}
            />
          </IconButton>

          {/* LinkedIn IconButton */}
          <IconButton
            href="https://www.linkedin.com/company/7007068/"
            sx={{ color: "#0077B5" }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon
              sx={{
                fontSize: isSuperMobile ? "1rem" : isMobile ? "1.2rem" : null,
              }}
            />
          </IconButton>
        </Box>
      </Box>

      {/* Modal for About, Privacy Policy, and Terms of Service */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            padding: 2,
          }}
          onClick={handleCloseModal} 
        >
          <Paper
            elevation={3}
            sx={{
              padding: "2rem",
              maxWidth: "80dvh",
              maxHeight: "90dvh",
              overflowY: "auto",
              textAlign: "left",

              borderRadius: 2,
              "@media (max-width: 600px)": {
                width: "80%",
              },
            }}
          >
            {modalContent && (
              <ModalContent
                contentKey={modalContent}
                onClose={handleCloseModal}
              />
            )}
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default Footer;
