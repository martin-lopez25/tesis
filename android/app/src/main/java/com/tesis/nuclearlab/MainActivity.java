package com.tesis.nuclearlab;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		hideNavigationBar();
	}

	@Override
	public void onWindowFocusChanged(boolean hasFocus) {
		super.onWindowFocusChanged(hasFocus);
		if (hasFocus) {
			hideNavigationBar();
		}
	}

	private void hideNavigationBar() {
		WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(
			getWindow(),
			getWindow().getDecorView()
		);
		controller.hide(WindowInsetsCompat.Type.navigationBars());
		controller.setSystemBarsBehavior(
			WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
		);
	}
}
