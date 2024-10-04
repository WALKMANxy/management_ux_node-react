// Footer.tsx

import React, { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FacebookIcon from "@mui/icons-material/Facebook";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import ModalContent from "./modalContent";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<"ourStory" | "privacyPolicy" | "termsOfService"| "team" | null>(null);

  const handleLogoClick = () => {
    window.scrollTo(0, 0);
  };

  const handleOpenModal = (content: "ourStory" | "privacyPolicy" | "termsOfService" | "team" ) => {
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
      <Box sx={{ flex: "90%", pt: 2, px: 6, pb: 2 }}>
        <Grid container spacing={2}>
          {/* Logo Section */}
          <Grid item xs={10} sm={6}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={handleLogoClick}
            >
              <img
                src="/images/logo-appbar.png"
                alt="Ricambi Centro Sud Logo"
                style={{ height: "40px", marginRight: "16px" }}
              />
              <Typography variant="h6" sx={{ color: "#FFFFFF" }}>
                #RicambiCentroSud
              </Typography>
            </Box>
          </Grid>

          {/* ABOUT Column */}
          <Grid item xs={10} sm={2}>
            <Typography variant="h6" fontWeight={300} sx={{ mb: 1 }}>
              {t("footer.about")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: "pointer", mb: 0.5, color: "#b0b0b0" }}
              onClick={() => handleOpenModal("ourStory")}
            >
              <Trans i18nKey="footer.ourStory">Our Story</Trans>
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: "pointer", color: "#b0b0b0" }}
              onClick={() => handleOpenModal("team")}
            >
              <Trans i18nKey="footer.team">Team</Trans>
            </Typography>
          </Grid>

          {/* HOURS Column */}
          <Grid item xs={10} sm={2}>
            <Typography variant="h6" fontWeight={300} sx={{ mb: 1 }}>
              {t("footer.hours") || "HOURS"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <AccessTimeIcon
                sx={{ mr: 1, color: "#b0b0b0", fontSize: "medium" }}
              />
              <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                8:30 - 13:00
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccessTimeIcon
                sx={{ mr: 1, color: "#b0b0b0", fontSize: "medium" }}
              />
              <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                15:00 - 18:30
              </Typography>
            </Box>
          </Grid>

          {/* LEGAL Column */}
          <Grid item xs={10} sm={2}>
            <Typography variant="h6" fontWeight={300} sx={{ mb: 1 }}>
              {t("footer.legal")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: "pointer", mb: 0.5, color: "#b0b0b0" }}
              onClick={() => handleOpenModal("privacyPolicy")}
            >
              <Trans i18nKey="footer.privacyPolicy">Privacy Policy</Trans>
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: "pointer", color: "#b0b0b0" }}
              onClick={() => handleOpenModal("termsOfService")}
            >
              <Trans i18nKey="footer.termsOfService">Terms of Service</Trans>
            </Typography>
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
          px: 6,
        }}
      >
        {/* Copyright */}
        <Typography variant="body2" sx={{ flex: 1, textAlign: "left" }}>
          &copy; 2024 Ricambi Centro Sud™
        </Typography>

        {/* Social Links */}
        <Box>
          <IconButton
            href="https://www.facebook.com/RicambiCentroSud/"
            sx={{ color: "#3b5998" }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/ricambicentrosud/"
            sx={{ color: "#E1306C" }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://goo.gl/maps/MFy1cqdn3BbQNmtW6"
            sx={{ color: "#4285F4" }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Maps"
          >
            <FmdGoodIcon />
          </IconButton>
          <IconButton
            href="https://www.linkedin.com/company/7007068/"
            sx={{ color: "#0077B5" }}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
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
            height: "100vh",
            padding: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: "2rem",
              width: "50%",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflowY: "auto",
              textAlign: "left",
              borderRadius: 2,
              "@media (max-width: 600px)": {
                width: "80%",
              },
            }}
          >
            {modalContent && (
              <ModalContent contentKey={modalContent} onClose={handleCloseModal} />
            )}
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

export default Footer;
