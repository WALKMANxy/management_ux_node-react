//src/components/landingPage/modalContent.tsx
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

interface ModalContentProps {
  contentKey: "ourStory" | "privacyPolicy" | "termsOfService" | "team";
  onClose: () => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ contentKey, onClose }) => {
  const { t } = useTranslation();

  const renderContent = () => {
    switch (contentKey) {
      case "ourStory":
        return (
          <Box>
            {/* Title */}
            <Typography variant="h4" sx={{ mb: 2 }}>
              {t("ourStory.title")}
            </Typography>
            <Divider
              sx={{
                backgroundColor: "white",
                width: "95%",
                margin: "0 auto",
                mb: 3,
              }}
            />

            {/* Content Parts */}
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="ourStory.content.part1">
                <strong>Random Company</strong> operates in the commercial
                vehicle, bus, truck, and auto parts sectors for diesel and
                gasoline engines, also dealing with bodywork and industrial,
                agricultural, maritime, and railway vehicles. Since 1995 in
                Catania, it offers services for choosing and selling the
                products offered with professionalism and competence, meeting
                the needs of public and private entities, spare parts dealers,
                pump specialists, mechanics, and electricians.
              </Trans>
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="ourStory.content.part2">
                The company, now expanding, is eager to offer this increasingly
                competent and effective service directly to private individuals,
                providing an opportunity and offering solutions for big and
                small vehicle problems. You will find qualified personnel in
                continuous training, capable of analyzing the problem and
                offering advice on the right alternatives. You can benefit from
                home delivery and complete 360-degree services.
              </Trans>
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="ourStory.content.part3">
                The company is a distributor of original spare parts brands, as
                well as officially reconditioned products directly from the
                manufacturer. The quality of service compared to price, the
                qualified technical area, and the management/project beyond
                simple direct sales are the three strong and distinctive points
                of Random Company The technical area, equipped with tools and
                continuous training, promotes the functional network in the
                area, guaranteeing updates and post-sales assistance to
                customers.
              </Trans>
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="ourStory.content.part4">
                <strong>
                  A company that has not lost its open and family-friendly
                  character
                </strong>{" "}
                but is in great expansion today, facing new challenges. The new
                structure, which spans 3,800 sqm over three levels, including
                offices, warehouse, and sales point, with a total of 25
                employees, is able to guarantee service in different areas of
                expertise across the territory thanks to specialized sales
                agents by product type and brand.
              </Trans>
            </Typography>
          </Box>
        );

      case "privacyPolicy":
        return (
          <Box>
            {/* Title */}
            <Typography variant="h4" sx={{ mb: 2 }}>
              {t("privacyPolicy.title")}
            </Typography>
            <Divider
              sx={{
                backgroundColor: "white",
                width: "95%",
                margin: "0 auto",
                mb: 3,
              }}
            />

            {/* Content Parts */}
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part1">
                <strong>Welcome to RCS NEXT</strong>, a browser-based
                application provided byRandom Company We take your privacy
                seriously and are committed to protecting the data we collect in
                compliance with GDPR regulations. This privacy policy outlines
                the types of information we collect, how it is used, and your
                rights regarding that information.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("privacyPolicy.content.part2")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part3">
                The data handled by Ricambi Centro Sud for the RCS NEXT app is
                collected solely for the purpose of ensuring the smooth
                functioning of the services provided. We may collect information
                such as your IP address and device fingerprint to validate your
                identity and enhance our authentication processes. This helps us
                ensure the security of your account and prevent unauthorized
                access.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("privacyPolicy.content.part4")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part5">
                The data collected is used to make the RCS NEXT app work as
                intended. Specifically, this includes enabling communication
                through chats within the company and between clients,
                facilitating access to statistics, managing visits, handling
                calendar appointments, and issuing or viewing promotions. There
                are no third-party analytics tools involved; your data is solely
                processed for operational purposes.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("privacyPolicy.content.part6")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part7">
                Ricambi Centro Sud does not share any collected data with
                external parties. Your data is strictly utilized by the company
                to support the services and functionalities of the RCS NEXT
                application.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("privacyPolicy.content.part8")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part9">
                You have the right to request access to the personal data we
                have collected about you, as well as the right to request
                correction or deletion of that data. If you wish to have your
                data deleted, please send an email to info@ricambicentrosud.com.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("privacyPolicy.content.part10")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part11">
                We take reasonable measures to protect your information from
                unauthorized access, alteration, or disclosure. However, please
                note that no system can be 100% secure.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("privacyPolicy.content.part12")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="privacyPolicy.content.part13">
                We may update this privacy policy from time to time. Any changes
                will be reflected here, and we encourage you to review this page
                periodically.
              </Trans>
            </Typography>
          </Box>
        );

      case "termsOfService":
        return (
          <Box>
            {/* Title */}
            <Typography variant="h4" sx={{ mb: 2 }}>
              {t("termsOfService.title")}
            </Typography>
            <Divider
              sx={{
                backgroundColor: "white",
                width: "95%",
                margin: "0 auto",
                mb: 3,
              }}
            />

            {/* Content Parts */}
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part1">
                <strong>Welcome to RCS NEXT</strong>, a browser-based
                application operated byRandom Company By accessing or using our
                application, you agree to be bound by these terms of service. If
                you do not agree with these terms, please do not use the app.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part2")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part3">
                By using the RCS NEXT app, you acknowledge that you have read,
                understood, and agree to these terms of service. We may update
                these terms occasionally, and it is your responsibility to
                review them regularly.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part4")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part5">
                RCS NEXT is intended for use by Ricambi Centro Sud employees and
                authorized clients only. The app provides access to internal
                communication features, company statistics, calendar management,
                and promotions. You agree to use the service for its intended
                purposes only and refrain from any activities that could disrupt
                or harm the app or other users.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part6")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part7">
                You are responsible for maintaining the confidentiality of your
                account credentials. Any activity under your account is your
                responsibility. If you believe your account has been
                compromised, please notify us immediately.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part8")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part9">
                All content within the RCS NEXT application, including but not
                limited to text, graphics, and trademarks, is the property of
                Random Company You may not copy, distribute, or create
                derivative works without our written consent.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part10")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part11">
                We reserve the right to suspend or terminate your access to the
                RCS NEXT app at any time, particularly if you violate these
                terms of service or use the app in a manner that we deem
                inappropriate or harmful.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part12")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part13">
                Ricambi Centro Sud provides the RCS NEXT app "as-is" and makes
                no guarantees regarding its performance or reliability. We are
                not liable for any damages arising from your use of the
                application.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part14")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part15">
                These terms shall be governed by and construed in accordance
                with the laws of Italy. Any disputes arising from the use of the
                RCS NEXT app will be subject to the jurisdiction of Italian
                courts.
              </Trans>
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              {t("termsOfService.content.part16")}
            </Typography>
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="termsOfService.content.part17">
                For questions regarding these terms, please contact us at
                info@ricambicentrosud.com.
              </Trans>
            </Typography>
          </Box>
        );

      case "team":
        return (
          <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {t("team.title")}
            </Typography>
            <Divider
              sx={{
                backgroundColor: "white",
                width: "95%",
                margin: "0 auto",
                mb: 3,
              }}
            />
            <Typography variant="body2" sx={{ textIndent: "2rem", mb: 2 }}>
              <Trans i18nKey="team.content.part1">
                Our team at Random Company is composed of dedicated
                professionals committed to providing top-notch services and
                solutions to our clients. With a diverse range of expertise, our
                team members collaborate seamlessly to ensure customer
                satisfaction and business growth.
              </Trans>
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {renderContent()}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: "grey.500",
            color: "white",
            "&:hover": {
              backgroundColor: "grey.700",
            },
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ModalContent;
