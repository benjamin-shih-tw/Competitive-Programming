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


const int mxn = 100005;

int n, m;
vector<int> g[mxn];
bool vis[mxn];
int col[mxn];

bool color(int now, int c) {
    vis[now] = true;
    col[now] = c;
    
    for (auto nxt : g[now]) {
        if (vis[nxt]) {
            if (col[nxt] == col[now]) return false;
        } else {
            if (!color(nxt, 3 - c)) return false;
        }
    }
    return true;
}

int main() {
    ios::sync_with_stdio(0); cin.tie(0);
    
    cin >> n >> m;
    while (m--) {
        int u, v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    
    foo(i, 1, n) {
        if (!vis[i]) {
            if (!color(i, 1)) {
                cout << "IMPOSSIBLE\n";
                return 0; 
            }
        }
    }
    
    foo(i, 1, n) {
        cout << col[i] << (i == n ? "" : " ");
    }
    cout << "\n";
    
    return 0;
}