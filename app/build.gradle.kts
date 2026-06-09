plugins {
    alias(libs.plugins.android.application)
    id("com.google.gms.google-services")
}

android {
    namespace = "com.taseera.app"
    compileSdk = 35

    signingConfigs {
        getByName("debug") {
            storeFile = file("C:/Users/admin/taseera key/taseera key")
            storePassword = "793131"
            keyAlias = "key0"
            keyPassword = "793131"
        }
        create("release") {
            storeFile = file("C:/Users/admin/taseera key/taseera key")
            storePassword = "793131"
            keyAlias = "key0"
            keyPassword = "793131"
        }
    }

    defaultConfig {
        applicationId = "com.taseera.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 26
        versionName = "1.0.0.26"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.webkit)
    implementation(libs.material)
    implementation(libs.nanohttpd)
    implementation(libs.gson)

    // Firebase BoM
    implementation(platform("com.google.firebase:firebase-bom:34.12.0"))
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.android.gms:play-services-auth:21.3.0")

    // Google Mobile Ads (AdMob)
    implementation("com.google.android.gms:play-services-ads:23.6.0")

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
