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
const ll mxn = 5e2+10;
ll dis[mxn][mxn];
const ll mx = 1e18;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll n,m,q;
    cin >> n >> m >> q;
    foo(i,1,n){
        foo(j,1,n){
            if(i == j) dis[i][j] = 0;
            else dis[i][j] = mx;
        }
    }

    while(m--){
        ll u,v,w;
        cin >> u >> v >> w;
        dis[u][v] = min(dis[u][v],w);
        dis[v][u] = min(dis[v][u],w);
    }

    foo(k,1,n){
        foo(i,1,n){
            foo(j,1,n){
                dis[i][j] = min(dis[i][j],dis[i][k] + dis[k][j]);
            }
        }
    }
    while(q--){
        ll a,b;
        cin >> a >> b;
        if(dis[a][b] >= mx) cout << -1 << '\n';
        else cout << dis[a][b] << '\n';
    }
}