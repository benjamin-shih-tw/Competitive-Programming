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
    ll n;
    cin >> n;
    vector<ll> v(n);
    fo(i,n) cin >> v[i];
    ll mx = 0;
    ll now = 0;
    fo(i,n){
        now = max(now + v[i],0LL);
        mx = max(mx,now);
    }
    if(mx == 0){
        cout << *max_element(ALL(v));
    }
    else cout << mx;
}