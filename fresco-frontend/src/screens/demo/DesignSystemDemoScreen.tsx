import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AppText,
  AppButton,
  AppInput,
  AppCard,
  AppBadge,
  AppHeader,
  AppDivider,
  AppLoader,
  EmptyState,
  ErrorState,
  ScreenContainer,
} from "../../components/common";
import { useTheme, colors, spacing } from "../../theme";

export const DesignSystemDemoScreen: React.FC = () => {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [cardPressCount, setCardPressCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"primitives" | "feedback">("primitives");

  const handleSimulateLoading = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader
        title="FRESCO Design System"
        subtitle="Phase 2A Reusable UI Foundation"
        showBack={false}
        rightAction={
          <AppBadge
            label="v1.0"
            variant="primary"
            size="sm"
          />
        }
      />

      <View style={styles.tabBar}>
        <AppButton
          title="UI Components"
          variant={activeTab === "primitives" ? "primary" : "ghost"}
          size="sm"
          onPress={() => setActiveTab("primitives")}
          style={styles.tabButton}
        />
        <AppButton
          title="States & Feedback"
          variant={activeTab === "feedback" ? "primary" : "ghost"}
          size="sm"
          onPress={() => setActiveTab("feedback")}
          style={styles.tabButton}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "primitives" ? (
          <>
            {/* Section 1: Typography Showcase */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                TYPOGRAPHY SCALE
              </AppText>
              <AppCard variant="outlined" padding="md">
                <AppText variant="display" color="primary">Display (32pt)</AppText>
                <AppText variant="h1" color="primary">Heading 1 (24pt)</AppText>
                <AppText variant="h2" color="primary">Heading 2 (20pt)</AppText>
                <AppText variant="h3" color="primary">Heading 3 (17pt)</AppText>
                <AppText variant="bodyLarge" color="secondary">Body Large (17pt Regular)</AppText>
                <AppText variant="body" color="primary">Body (15pt Regular)</AppText>
                <AppText variant="bodyMedium" color="primary">Body Medium (15pt Medium)</AppText>
                <AppText variant="bodyBold" color="primary">Body Bold (15pt SemiBold)</AppText>
                <AppText variant="caption" color="secondary">Caption (13pt Regular)</AppText>
                <AppText variant="label" color="brand">LABEL (11pt Bold Uppercase)</AppText>
              </AppCard>
            </View>

            <AppDivider spacing="md" />

            {/* Section 2: Badges Showcase */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                STATUS & SEMANTIC BADGES
              </AppText>
              <View style={styles.badgeRow}>
                <AppBadge label="Primary" variant="primary" showDot />
                <AppBadge label="Success / Paid" variant="success" showDot />
                <AppBadge label="Warning / In Process" variant="warning" showDot />
                <AppBadge label="Error / Cancelled" variant="error" showDot />
                <AppBadge label="Info / Placed" variant="info" showDot />
                <AppBadge label="Neutral" variant="neutral" />
              </View>
            </View>

            <AppDivider spacing="md" />

            {/* Section 3: Buttons Showcase */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                BUTTON VARIANTS & STATES
              </AppText>
              
              <View style={styles.componentStack}>
                <AppButton
                  title="Primary Button"
                  variant="primary"
                  size="md"
                  onPress={() => {}}
                  leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.textInverse} />}
                />

                <AppButton
                  title="Secondary Button"
                  variant="secondary"
                  size="md"
                  onPress={() => {}}
                />

                <AppButton
                  title="Outline Button"
                  variant="outline"
                  size="md"
                  onPress={() => {}}
                />

                <AppButton
                  title="Danger / Cancel Button"
                  variant="danger"
                  size="md"
                  onPress={() => {}}
                  leftIcon={<Ionicons name="trash-outline" size={18} color={colors.textInverse} />}
                />

                <AppButton
                  title={buttonLoading ? "Loading..." : "Simulate Loading Button"}
                  variant="primary"
                  size="md"
                  loading={buttonLoading}
                  onPress={handleSimulateLoading}
                />

                <AppButton
                  title="Disabled Button"
                  variant="primary"
                  size="md"
                  disabled
                  onPress={() => {}}
                />

                <View style={styles.sizeRow}>
                  <AppButton
                    title="Small"
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => {}}
                  />
                  <AppButton
                    title="Medium"
                    variant="primary"
                    size="md"
                    fullWidth={false}
                    onPress={() => {}}
                  />
                  <AppButton
                    title="Large"
                    variant="primary"
                    size="lg"
                    fullWidth={false}
                    onPress={() => {}}
                  />
                </View>
              </View>
            </View>

            <AppDivider spacing="md" />

            {/* Section 4: Input Fields Showcase */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                FORM INPUT CONTROLS
              </AppText>

              <AppInput
                label="Full Name"
                placeholder="Enter customer full name"
                value={inputText}
                onChangeText={setInputText}
                required
                leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
                helperText="Enter your legal first and last name."
              />

              <AppInput
                label="Password"
                placeholder="Enter account password"
                value={passwordText}
                onChangeText={setPasswordText}
                secureTextEntry
                required
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                helperText="Must be at least 8 characters."
              />

              <AppInput
                label="Validation Error State"
                placeholder="invalid.email"
                value="invalid-email-address"
                error="Please provide a valid email address."
                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.error} />}
              />

              <AppInput
                label="Special Instructions (Multiline)"
                placeholder="E.g. delicate silk fabric, do not iron collar"
                multiline
                numberOfLines={3}
              />
            </View>

            <AppDivider spacing="md" />

            {/* Section 5: Cards Showcase */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                CARD CONTAINERS
              </AppText>

              <View style={styles.componentStack}>
                <AppCard variant="elevated" padding="md">
                  <AppText variant="h3" color="primary">Elevated Surface Card</AppText>
                  <AppText variant="body" color="secondary" style={styles.cardText}>
                    Clean shadow and subtle border for primary order & catalog cards.
                  </AppText>
                </AppCard>

                <AppCard
                  variant="outlined"
                  padding="md"
                  onPress={() => setCardPressCount((prev) => prev + 1)}
                >
                  <AppText variant="h3" color="primary">Interactive Touchable Card</AppText>
                  <AppText variant="body" color="secondary" style={styles.cardText}>
                    Tap this card to test touch feedback. Tapped: {cardPressCount} times.
                  </AppText>
                </AppCard>

                <AppCard variant="flat" padding="md">
                  <AppText variant="h3" color="primary">Flat Inset Card</AppText>
                  <AppText variant="body" color="secondary" style={styles.cardText}>
                    Muted background for price breakdowns and information callouts.
                  </AppText>
                </AppCard>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Section 6: Loaders & Skeletons */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                LOADERS & SKELETON PLACEHOLDERS
              </AppText>

              <AppCard variant="outlined" padding="md">
                <AppText variant="bodyMedium" color="primary" style={styles.loaderSubtitle}>
                  Inline Spinner:
                </AppText>
                <AppLoader variant="spinner" size="small" message="Syncing with FRESCO service..." />

                <AppDivider spacing="sm" />

                <AppText variant="bodyMedium" color="primary" style={styles.loaderSubtitle}>
                  Card Skeleton Placeholders:
                </AppText>
                <AppLoader variant="skeleton" skeletonHeight={24} skeletonWidth="60%" style={styles.skeletonItem} />
                <AppLoader variant="skeleton" skeletonHeight={16} skeletonWidth="100%" style={styles.skeletonItem} />
                <AppLoader variant="skeleton" skeletonHeight={16} skeletonWidth="80%" style={styles.skeletonItem} />
              </AppCard>
            </View>

            <AppDivider spacing="md" />

            {/* Section 7: Empty State */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                EMPTY STATE COMPONENT
              </AppText>
              <AppCard variant="outlined" padding="none">
                <EmptyState
                  title="No Orders Yet"
                  description="Your clean clothes journey starts here. Explore our dry cleaning and laundry services."
                  actionTitle="Browse Catalog"
                  onActionPress={() => {}}
                />
              </AppCard>
            </View>

            <AppDivider spacing="md" />

            {/* Section 8: Error State */}
            <View style={styles.section}>
              <AppText variant="label" color="brand" style={styles.sectionTag}>
                ERROR STATE COMPONENT
              </AppText>
              <AppCard variant="outlined" padding="none">
                <ErrorState
                  title="Connection Problem"
                  message="Unable to reach the FRESCO server. Please verify your connection."
                  retryText="Try Again"
                  onRetry={() => {}}
                />
              </AppCard>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: spacing.xxs,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTag: {
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  componentStack: {
    gap: spacing.md,
  },
  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  cardText: {
    marginTop: spacing.xs,
  },
  loaderSubtitle: {
    marginBottom: spacing.xs,
  },
  skeletonItem: {
    marginBottom: spacing.xs,
  },
});
