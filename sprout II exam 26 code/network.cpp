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
const ll mxn = 2e5+10;
struct edge{
    ll u,v,w,id;
    bool operator<(const edge &other) const{
        return w < other.w;
    };
};
struct DSU{
    vector<ll> p;
    DSU(ll n){
        p.resize(n+1);
        foo(i,0,n) p[i] = i;
    }
    ll find(ll x) { return x == p[x] ? p[x] : p[x] = find(p[x]); }
    bool unite(ll x,ll y){
        ll px = find(x);
        ll py = find(y);
        if(px == py) return 0;
        p[px] = py;
        return 1;
    }
};
void solve() {
    cin >> n >> m;   
    vector<edge> g(m);
    DSU dsu(n);
    fo(i,m){
        cin >> g[i].u >> g[i].v >> g[i].w;
        g[i].id = i;
    }
    sort(ALL(g));
    ll cnt = 0;
    int idx = 0;
    while(idx < m){
        int j = idx;
        while(j < m and g[j].w == g[idx].w) j++;
        int valid = 0;
        for(int k = idx ; k < j ; k++){
            if(dsu.find(g[k].u) != dsu.find(g[k].v)) valid++;
        }
        int choose = 0;
        for(int k = idx ; k < j ; k++){
            if(dsu.unite(g[k].u,g[k].v)){
                choose++;
            }
        }
        cnt += valid - choose;
        idx = j;
    }
    cout << cnt;
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