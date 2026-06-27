
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
ll n,m;
const ll mxn = 5e5+10;
vector<pii> g[mxn];
ll idx[mxn];
ll dp[mxn];
stack<ll> stk;
ll ptr = 0;
bool in_stk[mxn];
ll scc_cnt = 0;
ll scc[mxn];
void tarjan(ll now){
    idx[now] = dp[now] = ++ptr;
    stk.push(now);
    in_stk[now] = 1;
    for(auto [nxt,w] : g[now]){
        if(!idx[nxt]){
            tarjan(nxt);
            dp[now] = min(dp[now],dp[nxt]);
        }
        else if(in_stk[nxt]){
            dp[now] = min(dp[now],idx[nxt]);
        }
    }
    if(dp[now] == idx[now]){
        scc_cnt++;
        ll x;
        do{
            x = stk.top();
            stk.pop();
            in_stk[x] = 0;
            scc[x] = scc_cnt;
        }while(x != now);
    }
}
vector<pii> ng[mxn];
ll indeg[mxn];

void solve() {
    cin >> n >> m;
    while(m--){
        ll u,v,w;
        cin >> u >> v >> w;
        g[u].pb({v,w});
    }
    foo(i,1,n){
        if(!idx[i]) tarjan(i);
    }
    foo(i,1,n){
        for(auto [nxt,w] : g[i]){
            if(scc[nxt] != scc[i]) {
                ng[scc[nxt]].pb({scc[i],w});
                indeg[scc[i]]++;
            }
        }
    }
    queue<ll> q;
    vector<ll> v(scc_cnt+1,1);
    foo(i,1,scc_cnt){
        if(indeg[i] == 0){
            q.push(i);
        }
    }
    while(SZ(q)){
        ll now = q.front();
        q.pop();
        for(auto [nxt,w] : ng[now]){
            v[nxt] = max(v[nxt],v[now] + w);
            if(!--indeg[nxt]) q.push(nxt);
        }
    }
    ll ans = 0;
    foo(i,1,n){
        cout << v[scc[i]] << ' ';
    }
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