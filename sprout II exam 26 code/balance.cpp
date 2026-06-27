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
struct item{
    ll v,c;
};
void solve() {
    ll n,W,k;
    cin >> n >> W >> k;
    vector<item> mx1(W+1,{-1,-1}),mx2(W+1,{-1,-1});
    mx1[0] = {0,0};
    fo(i,n){
        ll w,v,c;
        cin >> w >> v >> c;
        for(ll j = W ; j >= w ; j--){
            ll last_w = j-w;
            ll last_v = -1;

            if(last_w == 0) last_v = 0;
            else{
                if(mx1[last_w].v != -1){
                    if(mx1[last_w].c != c){
                        last_v = mx1[last_w].v;
                    }
                    else if(mx2[last_w].v != -1){
                        last_v = mx2[last_w].v;
                    }
                }
            }
            if(last_v != -1){
                ll nxt_v = last_v + v;
                if(c == mx1[j].c){
                    if(nxt_v > mx1[j].v){
                        mx1[j].v = nxt_v;
                    }
                }
                else if(c == mx2[j].c){
                    if(nxt_v > mx2[j].v){
                        mx2[j].v = nxt_v;
                        if(mx2[j].v > mx1[j].v){
                            swap(mx1[j],mx2[j]);
                        }
                    }
                }
                else{
                    if(nxt_v > mx1[j].v){
                        mx2[j] = mx1[j];
                        mx1[j]= {nxt_v,c};
                    }
                    else if(nxt_v > mx2[j].v){
                        mx2[j] = {nxt_v,c};
                    }
                }
            }
        }
    }
    ll ans = 0;
    for(ll j = 0 ; j <= W ; j++){
        ans = max(ans,mx1[j].v);
    }
    cout << ans;
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