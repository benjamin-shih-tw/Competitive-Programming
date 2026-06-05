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
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll r,q;
    cin >> r >> q;
    vector<vector<ll>> v(r,vector<ll>(r));
    fo(i,r){
        string s;
        cin >> s;
        fo(j,r){
            v[i][j] = (s[j] == '*');
        }
    }

    vector<vector<ll>> pref(r+1,vector<ll>(r+1,0));

    foo(i,1,r){
        foo(j,1,r){
            pref[i][j] = v[i-1][j-1] + pref[i-1][j] + pref[i][j-1] - pref[i-1][j-1];
        }
    }

    while(q--){
        ll x1,y1,x2,y2;
        cin >> x1 >> y1 >> x2 >> y2;
        cout << pref[x2][y2] - pref[x1-1][y2] - pref[x2][y1-1] + pref[x1-1][y1-1] << '\n';
    }
}