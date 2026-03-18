#include <bits/stdc++.h>
using namespace std;

long long n, m;
vector<long long> v;


long long check(long long x) {

    vector<pair<long long, long long>> stk;
    

    stk.push_back({n + 1, 0});

    long long total_reward = 0;


    for (long long i = n; i >= 1; i--) {

        while (stk.size() > 1 && v[stk.back().first] <= v[i]) {
            stk.pop_back();
        }


        long long target_idx = min(i + x, n);

        auto it = lower_bound(stk.begin(), stk.end(), target_idx,
            [](const pair<long long, long long>& a, long long val) {
                return a.first > val;
            });

        if (it != stk.end()) {
            total_reward += stk.back().second - (it - 1)->second;
        }


        stk.push_back({i, stk.back().second + v[i]});
    }
    return total_reward;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    if (!(cin >> n >> m)) return 0;

    v.resize(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> v[i];
    }


    long long l = 0, r = n - 1, ans = 0;
    while (l <= r) {
        long long mid = l + (r - l) / 2;
        if (check(mid) <= m) {
            ans = mid;    
            l = mid + 1;  
        } else {
            r = mid - 1;  
        }
    }

    cout << ans << "\n";
    return 0;
}