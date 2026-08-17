package com.taseera.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;

import java.io.OutputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;
import androidx.webkit.WebViewAssetLoader;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.firebase.messaging.FirebaseMessaging;

import org.json.JSONException;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "TaseeraWebView";
    private static final String START_URL = "https://appassets.androidplatform.net/assets/web/index.html";
    private static final int REQUEST_NOTIFICATIONS_PERMISSION = 4102;
    private static final int REQUEST_GOOGLE_SIGN_IN = 4103;
    private static final int REQUEST_SAVE_FILE = 4104;
    private static final String ADMOB_BANNER_UNIT_ID = "ca-app-pub-6810176545596111/3409229133";
    private static final String NOTIFICATION_CHANNEL_ID = "taseera_admin_messages";

    private FrameLayout rootFrame;
    private WebView webView;
    private GoogleSignInClient googleSignInClient;
    private FirebaseAuth firebaseAuth;
    private final Map<String, FrameLayout> adSlotViews = new HashMap<>();

    private String mPendingFileName;
    private String mPendingBase64Data;
    private String mPendingMimeType;

    private String buildStartUrl() {
        String versionName = "1.0";
        long versionCode = 1L;
        try {
            versionName = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = getPackageManager().getPackageInfo(getPackageName(), 0).getLongVersionCode();
            } else {
                versionCode = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
            }
        } catch (PackageManager.NameNotFoundException ignored) {
        }
        return START_URL + "?appVersion=" + Uri.encode(versionName) + "&build=" + versionCode;
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        MobileAds.initialize(this, initializationStatus -> {});
        ensureNotificationChannel();

        rootFrame = new FrameLayout(this);
        rootFrame.setBackgroundColor(Color.parseColor("#001F3F"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        rootFrame.addView(webView);

        setContentView(rootFrame);

        firebaseAuth = FirebaseAuth.getInstance();

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build();
        googleSignInClient = GoogleSignIn.getClient(this, gso);

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        WebView.setWebContentsDebuggingEnabled(true);
        webView.addJavascriptInterface(new TaseeraBridge(this), "TaseeraAndroid");
        webView.clearCache(true);
        webView.clearHistory();
        webView.clearFormData();

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(
                    TAG,
                    "JS: " + consoleMessage.message()
                        + " @"
                        + consoleMessage.sourceId()
                        + ":"
                        + consoleMessage.lineNumber()
                );
                return super.onConsoleMessage(consoleMessage);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(
                WebView view,
                WebResourceRequest request
            ) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if ("appassets.androidplatform.net".equals(host)) {
                    return false;
                }

                openIntentSafely(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // Let React handle the back press directly to ensure state consistency
                webView.evaluateJavascript(
                    "window.dispatchEvent(new PopStateEvent('popstate', {state: {source: 'android-back'}}))",
                    null
                );
            }
        });

        webView.loadUrl(buildStartUrl());
    }

    private void openIntentSafely(Intent intent) {
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException ignored) {
            Toast.makeText(this, "تعذر فتح التطبيق المطلوب.", Toast.LENGTH_SHORT).show();
        }
    }

    private void ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            "رسائل الإدارة",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("تنبيهات الرسائل المرسلة من إدارة تسعيرة.");

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    private boolean canPostNotifications() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
            || ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED;
    }

    private void showLocalNotification(String title, String body) {
        if (!canPostNotifications()) {
            return;
        }

        Intent intent = new Intent(this, MainActivity.class)
            .setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle((title == null || title.trim().isEmpty()) ? "Taseera" : title)
            .setContentText(body == null ? "" : body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body == null ? "" : body))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify((int) (System.currentTimeMillis() % Integer.MAX_VALUE), builder.build());
        }
    }

    private JSONObject buildPermissionsPayload() throws JSONException {
        JSONObject payload = new JSONObject();
        JSONObject notifications = new JSONObject();
        boolean notificationsAvailable = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU;
        boolean notificationsGranted = !notificationsAvailable
            || ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED;

        notifications.put("key", "notifications");
        notifications.put("label", "الإشعارات");
        notifications.put(
            "description",
            "لتنبيهات تحديثات طلبات عروض الأسعار والتنبيهات التشغيلية."
        );
        notifications.put("required", false);
        notifications.put("available", notificationsAvailable);
        notifications.put("granted", notificationsGranted);
        notifications.put(
            "status",
            !notificationsAvailable
                ? "not_required"
                : notificationsGranted ? "granted" : "denied"
        );
        payload.put("notifications", notifications);

        return payload;
    }

    private JSONObject buildCapabilitiesPayload() throws JSONException {
        JSONObject payload = new JSONObject();
        payload.put("platform", "android");
        payload.put("canShare", true);
        payload.put("canDial", true);
        payload.put("canEmail", true);
        payload.put("canNotify", true);
        payload.put("canPush", true);
        payload.put("canOpenExternal", true);
        payload.put("canOpenSettings", true);
        payload.put("canRateApp", true);
        return payload;
    }

    private JSONObject buildPlatformInfoPayload() throws JSONException {
        JSONObject payload = new JSONObject();
        String versionName = "1.0";
        try {
            versionName = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException ignored) {
        }

        payload.put("platform", "android");
        payload.put("packageName", getPackageName());
        payload.put("appVersion", versionName);
        payload.put("sdkInt", Build.VERSION.SDK_INT);
        return payload;
    }

    private void emitPermissionState() {
        if (webView == null) {
            return;
        }

        try {
            String payload = buildPermissionsPayload().toString();
            String escapedPayload = JSONObject.quote(payload);
            webView.post(() ->
                webView.evaluateJavascript(
                    "(function(){var payload=JSON.parse(" + escapedPayload + ");window.dispatchEvent(new CustomEvent('taseera:permissions-changed',{detail:payload}));})();",
                    null
                )
            );
        } catch (JSONException ignored) {
        }
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        @NonNull String[] permissions,
        @NonNull int[] grantResults
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_NOTIFICATIONS_PERMISSION) {
            emitPermissionState();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_GOOGLE_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                if (account != null && account.getIdToken() != null) {
                    authenticateWithFirebase(account.getIdToken(), account.getDisplayName(), account.getEmail());
                } else {
                    emitGoogleSignInError("Google account data is incomplete");
                }
            } catch (ApiException e) {
                Log.w(TAG, "Google sign in failed, code: " + e.getStatusCode(), e);
                emitGoogleSignInError("Google sign in failed (Status: " + e.getStatusCode() + ")");
            }
        } else if (requestCode == REQUEST_SAVE_FILE && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null) {
                writeFileToUri(uri);
            }
        }
    }

    private void writeFileToUri(Uri uri) {
        try {
            byte[] decodedBytes = Base64.decode(mPendingBase64Data, Base64.DEFAULT);
            try (OutputStream outputStream = getContentResolver().openOutputStream(uri)) {
                if (outputStream != null) {
                    outputStream.write(decodedBytes);
                    runOnUiThread(() -> Toast.makeText(this, "تم حفظ الملف بنجاح", Toast.LENGTH_SHORT).show());
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error writing file", e);
            runOnUiThread(() -> Toast.makeText(this, "فشل حفظ الملف: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } finally {
            mPendingBase64Data = null;
            mPendingFileName = null;
            mPendingMimeType = null;
        }
    }

    private void authenticateWithFirebase(String idToken, String displayName, String email) {
        AuthCredential credential = GoogleAuthProvider.getCredential(idToken, null);
        firebaseAuth.signInWithCredential(credential)
            .addOnCompleteListener(this, task -> {
                if (task.isSuccessful()) {
                    String uid = task.getResult() != null && task.getResult().getUser() != null
                        ? task.getResult().getUser().getUid()
                        : "";
                    String resolvedName = task.getResult() != null && task.getResult().getUser() != null
                        ? task.getResult().getUser().getDisplayName()
                        : displayName;
                    String resolvedEmail = task.getResult() != null && task.getResult().getUser() != null
                        ? task.getResult().getUser().getEmail()
                        : email;
                    emitGoogleSignInSuccess(uid, resolvedName, resolvedEmail, idToken);
                } else {
                    Log.w(TAG, "signInWithCredential:failure", task.getException());
                    String message = task.getException() != null && task.getException().getMessage() != null
                        ? task.getException().getMessage()
                        : "Firebase authentication failed";
                    emitGoogleSignInError(message);
                }
            });
    }

    private void emitGoogleSignInSuccess(String uid, String displayName, String email, String idToken) {
        if (webView == null) {
            return;
        }

        try {
            JSONObject data = new JSONObject();
            data.put("uid", uid != null ? uid : "");
            data.put("displayName", displayName != null ? displayName : "");
            data.put("email", email != null ? email : "");
            data.put("idToken", idToken != null ? idToken : "");
            String payload = data.toString();
            String escapedPayload = JSONObject.quote(payload);
            webView.post(() ->
                webView.evaluateJavascript(
                    "(function(){var payload=JSON.parse(" + escapedPayload + ");window.dispatchEvent(new CustomEvent('taseera:google-signin-success',{detail:payload}));})();",
                    null
                )
            );
        } catch (JSONException ignored) {
        }
    }

    private void emitGoogleSignInError(String error) {
        if (webView == null) {
            return;
        }

        String escapedError = JSONObject.quote(error);
        webView.post(() ->
            webView.evaluateJavascript(
                "(function(){window.dispatchEvent(new CustomEvent('taseera:google-signin-error',{detail:{error:" + escapedError + "}}));})();",
                null
            )
        );
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    private FrameLayout createAdSlotView(String slotId) {
        FrameLayout slot = new FrameLayout(this);
        slot.setVisibility(FrameLayout.GONE);
        slot.setElevation(18f);
        rootFrame.addView(slot, new FrameLayout.LayoutParams(1, 1));
        adSlotViews.put(slotId, slot);
        loadBannerAd(slot);
        return slot;
    }

    private void loadBannerAd(FrameLayout slot) {
        AdView banner = new AdView(this);
        banner.setAdUnitId(ADMOB_BANNER_UNIT_ID);
        banner.setAdSize(AdSize.BANNER);
        slot.removeAllViews();
        slot.addView(banner, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        banner.loadAd(new AdRequest.Builder().build());
    }

    private void updateAdMobSlots(String payload) {
        try {
            JSONArray slots = new JSONArray(payload);
            Set<String> seen = new HashSet<>();

            for (int i = 0; i < slots.length(); i++) {
                JSONObject item = slots.getJSONObject(i);
                String id = item.optString("id");
                if (id.isEmpty()) continue;

                seen.add(id);
                FrameLayout slot = adSlotViews.get(id);
                if (slot == null) {
                    slot = createAdSlotView(id);
                }

                int left = item.optInt("left", 0);
                int top = item.optInt("top", 0);
                int width = Math.max(1, item.optInt("width", 1));
                int height = Math.max(1, item.optInt("height", 1));
                boolean visible = item.optBoolean("visible", false);

                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(width, height);
                params.leftMargin = left;
                params.topMargin = top;
                slot.setLayoutParams(params);
                slot.setVisibility(visible ? FrameLayout.VISIBLE : FrameLayout.GONE);
            }

            for (Map.Entry<String, FrameLayout> entry : adSlotViews.entrySet()) {
                if (!seen.contains(entry.getKey())) {
                    entry.getValue().setVisibility(FrameLayout.GONE);
                }
            }
        } catch (JSONException exception) {
            Log.w(TAG, "Invalid AdMob slot payload", exception);
        }
    }

    private void emitPushToken(String uid) {
        FirebaseMessaging.getInstance().getToken()
            .addOnSuccessListener(token -> {
                if (webView == null || token == null || token.isEmpty()) {
                    return;
                }

                try {
                    JSONObject payload = new JSONObject();
                    payload.put("uid", uid != null ? uid : "");
                    payload.put("token", token);
                    String escapedPayload = JSONObject.quote(payload.toString());
                    webView.post(() ->
                        webView.evaluateJavascript(
                            "(function(){var payload=JSON.parse(" + escapedPayload + ");window.dispatchEvent(new CustomEvent('taseera:push-token',{detail:payload}));})();",
                            null
                        )
                    );
                } catch (JSONException exception) {
                    Log.w(TAG, "Unable to emit push token", exception);
                }
            })
            .addOnFailureListener(exception -> Log.w(TAG, "Unable to get FCM token", exception));
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onDestroy() {
        for (FrameLayout slot : adSlotViews.values()) {
            for (int i = 0; i < slot.getChildCount(); i++) {
                if (slot.getChildAt(i) instanceof AdView) {
                    ((AdView) slot.getChildAt(i)).destroy();
                }
            }
        }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    private final class TaseeraBridge {
        private final Context context;

        private TaseeraBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public String getPermissionsStatus() {
            try {
                return buildPermissionsPayload().toString();
            } catch (JSONException exception) {
                return "{}";
            }
        }

        @JavascriptInterface
        public String getCapabilities() {
            try {
                return buildCapabilitiesPayload().toString();
            } catch (JSONException exception) {
                return "{}";
            }
        }

        @JavascriptInterface
        public String getPlatformInfo() {
            try {
                return buildPlatformInfoPayload().toString();
            } catch (JSONException exception) {
                return "{}";
            }
        }

        @JavascriptInterface
        public void requestNotificationsPermission() {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
                emitPermissionState();
                return;
            }

            runOnUiThread(() -> ActivityCompat.requestPermissions(
                MainActivity.this,
                new String[]{Manifest.permission.POST_NOTIFICATIONS},
                REQUEST_NOTIFICATIONS_PERMISSION
            ));
        }

        @JavascriptInterface
        public void requestPushToken(String uid) {
            runOnUiThread(() -> MainActivity.this.emitPushToken(uid));
        }

        @JavascriptInterface
        public void openAppSettings() {
            runOnUiThread(() -> openIntentSafely(
                new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                    .setData(Uri.fromParts("package", getPackageName(), null))
            ));
        }

        @JavascriptInterface
        public void openExternalUrl(String url) {
            runOnUiThread(() -> openIntentSafely(new Intent(Intent.ACTION_VIEW, Uri.parse(url))));
        }

        @JavascriptInterface
        public void openDialer(String phoneNumber) {
            runOnUiThread(() -> openIntentSafely(
                new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + phoneNumber))
            ));
        }

        @JavascriptInterface
        public void openEmail(String email, String subject, String body) {
            runOnUiThread(() -> {
                String uriString = "mailto:" + Uri.encode(email) +
                    "?subject=" + Uri.encode(subject) +
                    "&body=" + Uri.encode(body);
                Intent intent = new Intent(Intent.ACTION_SENDTO);
                intent.setData(Uri.parse(uriString));
                openIntentSafely(intent);
            });
        }

        @JavascriptInterface
        public void shareText(String title, String text) {
            runOnUiThread(() -> {
                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType("text/plain");
                shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
                shareIntent.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(shareIntent, title));
            });
        }

        @JavascriptInterface
        public void rateApp() {
            runOnUiThread(() -> {
                Intent marketIntent = new Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse("market://details?id=" + getPackageName())
                );
                try {
                    startActivity(marketIntent);
                } catch (ActivityNotFoundException exception) {
                    openIntentSafely(
                        new Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse(
                                "https://play.google.com/store/apps/details?id=" + getPackageName()
                            )
                        )
                    );
                }
            });
        }

        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(MainActivity.this::finishAffinity);
        }

        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(context, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void showLocalNotification(String title, String body) {
            runOnUiThread(() -> MainActivity.this.showLocalNotification(title, body));
        }

        @JavascriptInterface
        public void updateAdMobSlots(String payload) {
            runOnUiThread(() -> MainActivity.this.updateAdMobSlots(payload));
        }

        @JavascriptInterface
        public void signInWithGoogle() {
            runOnUiThread(() -> {
                try {
                    googleSignInClient.signOut().addOnCompleteListener(task -> {
                        Intent signInIntent = googleSignInClient.getSignInIntent();
                        startActivityForResult(signInIntent, REQUEST_GOOGLE_SIGN_IN);
                    });
                } catch (Exception exception) {
                    emitGoogleSignInError(
                        exception.getMessage() != null ? exception.getMessage() : "Unable to open Google sign-in"
                    );
                }
            });
        }

        @JavascriptInterface
        public void saveFile(String fileName, String base64Data, String mimeType) {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType(mimeType);
                    intent.putExtra(Intent.EXTRA_TITLE, fileName);

                    // We need to store these temporarily to use in onActivityResult
                    mPendingFileName = fileName;
                    mPendingBase64Data = base64Data;
                    mPendingMimeType = mimeType;

                    startActivityForResult(intent, REQUEST_SAVE_FILE);
                } catch (Exception e) {
                    showToast("Error saving file: " + e.getMessage());
                }
            });
        }
    }
}
