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
    ll n,q;
    cin >> n >> q;
    vector<ll> v(n);
    fo(i,n) cin >> v[i];
    vector<ll> pref(n+1);
    pref[0] = 0;
    foo(i,1,n){
        pref[i] = pref[i-1] ^ v[i-1];
    }
    while(q--){
        ll l,r;
        cin >> l >> r;
        cout << (pref[r] ^ pref[l-1]) << '\n';
    }
}