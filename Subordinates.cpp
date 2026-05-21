#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
const int mxn = 2e5+10;
vector<int> g[mxn];
int sz[mxn];
int n,m;
void dfs(int now,int par){
    sz[now] = 1;
    for(auto nxt : g[now]){
        if(nxt == par) continue;
        dfs(nxt,now);
        sz[now] += sz[nxt];
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> n;
    foo(i,2,n){
        int x; cin >> x;
        g[i].pb(x);
        g[x].pb(i);
    }
    dfs(1,0);
    foo(i,1,n) cout << sz[i]-1 << " ";
}