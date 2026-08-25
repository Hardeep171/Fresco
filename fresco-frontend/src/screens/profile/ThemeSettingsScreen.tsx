import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList, PartnerProfileStackParamList } from "../../types/navigation.types";
import { useTheme, ThemeMode, spacing, radius } from "../../theme";
import {
  ScreenContainer,
  AppHeader,
  AppCard,
  AppText,
  AppBadge,
  AppDivider,
} from "../../components/common";

type Props = NativeStackScreenProps<
  ProfileStackParamList | PartnerProfileStackParamList,
  "ThemeSettingsScreen"
>;

interface ThemeOptionItem {
  id: ThemeMode;
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  activeIconName: keyof typeof Ionicons.glyphMap;
}

const THEME_OPTIONS: ThemeOptionItem[] = [
  {
    id: "system",
    label: "System Default",
    description: "Automatically adjusts with your device system appearance setting",
    iconName: "phone-portrait-outline",
    activeIconName: "phone-portrait",
  },
  {
    id: "light",
    label: "Light Theme",
    description: "Always use clean, high-contrast light surfaces and bright typography",
    iconName: "sunny-outline",
    activeIconName: "sunny",
  },
  {
    id: "dark",
    label: "Dark Theme",
    description: "Always use sleek, eye-friendly slate surfaces and soft contrast",
    iconName: "moon-outline",
    activeIconName: "moon",
  },
];

export const ThemeSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { mode, setThemeMode, isDark, colors, systemColorScheme } = useTheme();

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Appearance & Theme"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <AppBadge
            label={isDark ? "DARK MODE" : "LIGHT MODE"}
            variant="primary"
            size="sm"
            showDot
          />
        }
      />

      {/* Intro info card */}
      <AppCard variant="outlined" padding="md" style={styles.introCard}>
        <View style={styles.introRow}>
          <View style={[styles.introIconCircle, { backgroundColor: colors.primarySurface }]}>
            <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.introText}>
            <AppText variant="h3" color="primary">
              Choose App Appearance
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.introSubtext}>
              Customise how FRESCO looks on your device. Live switching applies instantly across the entire application.
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Theme selection options */}
      <AppCard variant="outlined" padding="none" style={styles.optionsCard}>
        <AppText variant="label" color="secondary" style={styles.sectionTitle}>
          SELECT THEME MODE
        </AppText>

        {THEME_OPTIONS.map((option, index) => {
          const isSelected = mode === option.id;
          const isLast = index === THEME_OPTIONS.length - 1;

          return (
            <React.Fragment key={option.id}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setThemeMode(option.id)}
                style={[
                  styles.optionRow,
                  isSelected && { backgroundColor: colors.primarySurface },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${option.label}: ${option.description}`}
              >
                <View
                  style={[
                    styles.optionIconCircle,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                    },
                  ]}
                >
                  <Ionicons
                    name={isSelected ? option.activeIconName : option.iconName}
                    size={22}
                    color={isSelected ? colors.textInverse : colors.primary}
                  />
                </View>

                <View style={styles.optionTextContainer}>
                  <View style={styles.optionTitleRow}>
                    <AppText
                      variant="bodyBold"
                      color={isSelected ? "brand" : "primary"}
                    >
                      {option.label}
                    </AppText>
                    {option.id === "system" && (
                      <AppBadge
                        label={`System: ${systemColorScheme.toUpperCase()}`}
                        variant="info"
                        size="sm"
                      />
                    )}
                  </View>
                  <AppText variant="caption" color="secondary" style={styles.optionDescription}>
                    {option.description}
                  </AppText>
                </View>

                {/* Radio Indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {!isLast && <AppDivider spacing="none" />}
            </React.Fragment>
          );
        })}
      </AppCard>

      {/* Live Preview Card */}
      <AppCard variant="elevated" padding="md" style={styles.previewCard}>
        <AppText variant="label" color="secondary" style={styles.previewHeader}>
          LIVE THEME PREVIEW
        </AppText>

        <View style={[styles.previewBox, { backgroundColor: colors.surfaceMuted }]}>
          <View style={styles.previewTopRow}>
            <View style={[styles.previewChip, { backgroundColor: colors.surface }]}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={16}
                color={colors.primary}
                style={styles.previewChipIcon}
              />
              <AppText variant="captionMedium" color="primary">
                Active: {mode.toUpperCase()} ({isDark ? "Dark" : "Light"})
              </AppText>
            </View>

            <AppBadge label="Verified Token" variant="success" size="sm" showDot />
          </View>

          <View style={styles.previewSampleRow}>
            <View style={[styles.previewSampleItem, { backgroundColor: colors.surface }]}>
              <AppText variant="caption" color="muted">
                Surface Base
              </AppText>
              <AppText variant="bodyBold" color="primary">
                {isDark ? "Dark Slate" : "Clean White"}
              </AppText>
            </View>

            <View style={[styles.previewSampleItem, { backgroundColor: colors.surface }]}>
              <AppText variant="caption" color="muted">
                Brand Accent
              </AppText>
              <AppText variant="bodyBold" color="brand">
                Ocean Blue
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color="secondary" style={styles.previewNote}>
            FRESCO automatically optimizes readability, contrast ratios, and surface depth across all screens.
          </AppText>
        </View>
      </AppCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  introCard: {
    marginVertical: spacing.md,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  introIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  introText: {
    flex: 1,
  },
  introSubtext: {
    marginTop: spacing.xxs,
    lineHeight: 18,
  },
  optionsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    letterSpacing: 0.8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionDescription: {
    marginTop: spacing.xxs,
    lineHeight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: radius.round,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.round,
  },
  previewCard: {
    marginBottom: spacing.xxl,
  },
  previewHeader: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  previewBox: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  previewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  previewChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.round,
  },
  previewChipIcon: {
    marginRight: 4,
  },
  previewSampleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewSampleItem: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  previewNote: {
    lineHeight: 16,
    fontStyle: "italic",
  },
});
