#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<ll,ll>
#define SZ(x) ((ll)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(ll i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(ll i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
template<class T> bool chmax(T &a, const T &b) { return a < b ? (a = b, 1) : 0; }
template<class T> bool chmin(T &a, const T &b) { return a > b ? (a = b, 1) : 0; }
#ifndef ONLINE_JUDGE
#define dbg(x) cerr << "\033[1;33m[ " << #x << " = " << (x) << " ]\033[0m\n"
#else
#define dbg(x)
#endif
void solve() {
    ll n,m,s;
    cin >> n >> m >> s;
    vector<pii> r(m);
    for(auto &[a,b] : r) cin >> a >> b;

    ll mx = 1 << n;

    vector<vector<ll>> b_(mx),rev_(mx);

    fo(i,m) b_[r[i].F].pb(r[i].second);
    fo(i,m){
        for(ll j = i+1 ; j < m ; j++){
            if(!(r[i].F & r[j].F)){
                b_[r[i].F | r[j].F].pb(r[i].S | r[j].S);
            }
        }
    }
    vector<ll> out(mx,0),state(mx,0);
    queue<ll> q;
    fo(t,mx){
        vector<ll> nxt;
        for(ll a = t ; a > 0 ; a = (a-1) & t)
            for(ll B : b_[a]) nxt.pb((t^a) | B);
        sort(ALL(nxt));
        nxt.erase(unique(nxt.begin(),nxt.end()),nxt.end());
        out[t] = SZ(nxt);
        if(!out[t]) { state[t] = -1; q.push(t); }
        for(ll v : nxt) rev_[v].pb(t);
    }
    while(SZ(q)){
        ll now = q.front(); q.pop();
        for(auto p : rev_[now]){
            if(state[p]) continue;
            if(state[now] == -1){
                state[p] = 1; q.push(p);
            }
            else if(--out[p] == 0){
                state[p] = -1; q.push(p);
            }
        }
    }
    cout << (state[s] == 1 ? "First" : state[s] == -1 ? "Second" : "Draw") << '\n';
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    ll t = 1;
    // cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}