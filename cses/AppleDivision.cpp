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
    ll sum = accumulate(ALL(v),0LL);

    ll best = LLONG_MAX;

    for(ll mask = 0 ; mask < (1 << n) ; mask++){
        ll s = 0;
        for(ll j = 0 ; j < n ; j++){
            if(mask & (1 << j)){
                s += v[j];
            }
        }
        ll other = sum - s;
        best = min(best,llabs(other - s));
    }
    cout << best;
}